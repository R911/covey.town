import React, {
  Dispatch,
  SetStateAction,
  useCallback,
  useEffect,
  useMemo,
  useReducer,
  useState,
} from 'react';
import './App.css';
import { BrowserRouter } from 'react-router-dom';
import { io, Socket } from 'socket.io-client';
import { ChakraProvider, Grid, GridItem } from '@chakra-ui/react';
import { MuiThemeProvider } from '@material-ui/core/styles';
import assert from 'assert';
import HomePage from './components/Login/HomePage';
import { CoveyAppState, NearbyPlayers } from './CoveyTypes';
import VideoContext from './contexts/VideoContext';
import Login from './components/Login/Login';
import CoveyAppContext from './contexts/CoveyAppContext';
import NearbyPlayersContext from './contexts/NearbyPlayersContext';
import AppStateProvider, { useAppState } from './components/VideoCall/VideoFrontend/state';
import useConnectionOptions from './components/VideoCall/VideoFrontend/utils/useConnectionOptions/useConnectionOptions';
import UnsupportedBrowserWarning from './components/VideoCall/VideoFrontend/components/UnsupportedBrowserWarning/UnsupportedBrowserWarning';
import { VideoProvider } from './components/VideoCall/VideoFrontend/components/VideoProvider';
import ErrorDialog from './components/VideoCall/VideoFrontend/components/ErrorDialog/ErrorDialog';
import theme from './components/VideoCall/VideoFrontend/theme';
import { Callback } from './components/VideoCall/VideoFrontend/types';
import Player, { ServerPlayer, UserLocation } from './classes/Player';
import TownsServiceClient, { TownJoinResponse } from './classes/TownsServiceClient';
import Video from './classes/Video/Video';
import ChatFeature from './components/Chat/ChatFeature';
import MeetingNotes from './components/Notes/MeetingNotes';
import WorldMap from './components/world/WorldMap';
import VideoOverlay from './components/VideoCall/VideoOverlay/VideoOverlay';

type CoveyAppUpdate =
  | { action: 'doConnect'; data: { userName: string, townFriendlyName: string, townID: string,townIsPubliclyListed:boolean, chatToken: string, capacity: number ,sessionToken: string, myPlayerID: string, socket: Socket, players: Player[], emitMovement: (location: UserLocation) => void } }
  | { action: 'addPlayer'; player: Player }
  | { action: 'playerMoved'; player: Player }
  | { action: 'playerDisconnect'; player: Player }
  | { action: 'weMoved'; location: UserLocation }
  | { action: 'disconnect' }
  | { action: 'doLogin'; data: { userName: string, authToken: string, userID: string } }
  | { action: 'playerUpdated'; player: Player }
  | { action: 'playerAskedToBecomeAdmin'; player: Player }
  ;

function defaultAppState(): CoveyAppState {
  return {
    nearbyPlayers: { nearbyPlayers: [] },
    chatToken: '',
    players: [],
    askedToBecomeAdmin:[],
    myPlayerID: '',
    currentTownFriendlyName: '',
    currentTownID: '',
    currentTownIsPubliclyListed: false,
    currentTownCapacity: 50,
    sessionToken: '',
    authToken: '',
    userID: '',
    userName: '',
    socket: null,
    currentLocation: {
      x: 0,
      y: 0,
      rotation: 'front',
      moving: false,
    },
    emitMovement: () => {},
    apiClient: new TownsServiceClient(),
  };
}
function appStateReducer(state: CoveyAppState, update: CoveyAppUpdate): CoveyAppState {
  const nextState = {
    sessionToken: state.sessionToken,
    authToken: state.authToken,
    currentTownFriendlyName: state.currentTownFriendlyName,
    chatToken: state.chatToken,
    currentTownID: state.currentTownID,
    currentTownIsPubliclyListed: state.currentTownIsPubliclyListed,
    currentTownCapacity: state.currentTownCapacity,
    myPlayerID: state.myPlayerID,
    players: state.players,
    askedToBecomeAdmin: state.askedToBecomeAdmin,
    currentLocation: state.currentLocation,
    nearbyPlayers: state.nearbyPlayers,
    userName: state.userName,
    userID: state.userID,
    socket: state.socket,
    emitMovement: state.emitMovement,
    apiClient: state.apiClient,
  };

  function calculateNearbyPlayers(players: Player[], currentLocation: UserLocation) {
    const isWithinCallRadius = (p: Player, location: UserLocation) => {
      if (p.location && location) {
        const dx = p.location.x - location.x;
        const dy = p.location.y - location.y;
        const d = Math.sqrt(dx * dx + dy * dy);
        return d < 80;
      }
      return false;
    };
    return { nearbyPlayers: players.filter(p => isWithinCallRadius(p, currentLocation)) };
  }

  function samePlayers(a1: NearbyPlayers, a2: NearbyPlayers) {
    if (a1.nearbyPlayers.length !== a2.nearbyPlayers.length) return false;
    const ids1 = a1.nearbyPlayers.map(p => p.id).sort();
    const ids2 = a2.nearbyPlayers.map(p => p.id).sort();
    return !ids1.some((val, idx) => val !== ids2[idx]);
  }

  let updatePlayer;
  switch (update.action) {
    case 'doConnect':
      nextState.sessionToken = update.data.sessionToken;
      nextState.myPlayerID = update.data.myPlayerID;
      nextState.chatToken = update.data.chatToken;
      nextState.currentTownFriendlyName = update.data.townFriendlyName;
      nextState.currentTownID = update.data.townID;
      nextState.currentTownIsPubliclyListed = update.data.townIsPubliclyListed;
      nextState.currentTownCapacity = update.data.capacity;
      nextState.userName = update.data.userName;
      nextState.emitMovement = update.data.emitMovement;
      nextState.socket = update.data.socket;
      nextState.players = update.data.players;
      break;
    case 'addPlayer':
      nextState.players = nextState.players.concat([update.player]);
      break;
    case 'playerMoved':
      updatePlayer = nextState.players.find(p => p.id === update.player.id);
      if (updatePlayer) {
        updatePlayer.location = update.player.location;
      } else {
        nextState.players = nextState.players.concat([update.player]);
      }
      nextState.nearbyPlayers = calculateNearbyPlayers(
        nextState.players,
        nextState.currentLocation,
      );
      if (samePlayers(nextState.nearbyPlayers, state.nearbyPlayers)) {
        nextState.nearbyPlayers = state.nearbyPlayers;
      }
      break;
    case 'playerUpdated':
      updatePlayer = nextState.players.find((p) => p.id === update.player.id);
      if (updatePlayer) {
        updatePlayer.privileges = update.player.privileges;
      } else {
        nextState.players = nextState.players.concat([update.player]);
      }
      break;
    case 'playerAskedToBecomeAdmin':
      nextState.askedToBecomeAdmin = nextState.askedToBecomeAdmin.concat([update.player]);
      break;
    case 'weMoved':
      nextState.currentLocation = update.location;
      nextState.nearbyPlayers = calculateNearbyPlayers(
        nextState.players,
        nextState.currentLocation,
      );
      if (samePlayers(nextState.nearbyPlayers, state.nearbyPlayers)) {
        nextState.nearbyPlayers = state.nearbyPlayers;
      }
      break;
    case 'playerDisconnect':
      nextState.players = nextState.players.filter(player => player.id !== update.player.id);

      nextState.nearbyPlayers = calculateNearbyPlayers(
        nextState.players,
        nextState.currentLocation,
      );
      if (samePlayers(nextState.nearbyPlayers, state.nearbyPlayers)) {
        nextState.nearbyPlayers = state.nearbyPlayers;
      }
      break;
    case 'disconnect':
      state.socket?.disconnect();
      nextState.nearbyPlayers= { nearbyPlayers: [] };
      nextState.chatToken= '';
      nextState.players= [];
      nextState.askedToBecomeAdmin=[];
      nextState.myPlayerID= '';
      nextState.currentTownFriendlyName= '';
      nextState.currentTownID= '';
      nextState.currentTownIsPubliclyListed= false;
      nextState.currentTownCapacity= 50;
      nextState.sessionToken= '';
      nextState.socket= null;
      nextState.currentLocation= {
        x: 0,
        y: 0,
        rotation: 'front',
        moving: false,
      };
      nextState.emitMovement= () => {};
      nextState.apiClient= new TownsServiceClient();
      break;
    case 'doLogin':
      nextState.authToken = update.data.authToken;
      nextState.userName = update.data.userName;
      nextState.userID = update.data.userID;
      break;
    default:
      throw new Error('Unexpected state request');
  }
  return nextState;
}

async function GameController(
  initData: TownJoinResponse,
  dispatchAppUpdate: (update: CoveyAppUpdate) => void,
) {
  // Now, set up the game sockets
  const gamePlayerID = initData.coveyUserID;
  const sessionToken = initData.coveySessionToken;
  const chatToken = initData.providerChatToken;
  const url = process.env.REACT_APP_TOWNS_SERVICE_URL;
  assert(url);
  const video = Video.instance();
  assert(video);
  const roomName = video.townFriendlyName;
  assert(roomName);
  const {townCapacity} = video;
  assert(townCapacity);
  const socket = io(url, { auth: { token: sessionToken, coveyTownID: video.coveyTownID } });
  socket.on('newPlayer', (player: ServerPlayer) => {
    dispatchAppUpdate({
      action: 'addPlayer',
      player: Player.fromServerPlayer(player),
    });
  });
  socket.on('playerMoved', (player: ServerPlayer) => {
    if (player._id !== gamePlayerID) {
      dispatchAppUpdate({ action: 'playerMoved', player: Player.fromServerPlayer(player) });
    }
  });
  socket.on('playerDisconnect', (player: ServerPlayer) => {
    dispatchAppUpdate({ action: 'playerDisconnect', player: Player.fromServerPlayer(player) });
  });
  socket.on('disconnect', () => {
    dispatchAppUpdate({ action: 'disconnect' });
  });
  const emitMovement = (location: UserLocation) => {
    socket.emit('playerMovement', location);
    dispatchAppUpdate({ action: 'weMoved', location });
  };
  socket.on('playerUpdated', (player: ServerPlayer) => {
    dispatchAppUpdate({ action: 'playerUpdated', player: Player.fromServerPlayer(player) });
  });
  socket.on('playerAskedToBecomeAdmin', (player:ServerPlayer) =>{
    dispatchAppUpdate({ action: 'playerAskedToBecomeAdmin', player:Player.fromServerPlayer(player)});
  });

  dispatchAppUpdate({
    action: 'doConnect',
    data: {
      sessionToken,
      chatToken,
      userName: video.userName,
      townFriendlyName: roomName,
      townID: video.coveyTownID,
      myPlayerID: gamePlayerID,
      townIsPubliclyListed: video.isPubliclyListed,
      capacity: townCapacity,
      emitMovement,
      socket,
      players: initData.currentPlayers.map(sp => Player.fromServerPlayer(sp)),
    },
  });
  return true;
}

function App(props: { setOnDisconnect: Dispatch<SetStateAction<Callback | undefined>> }) {
  const [appState, dispatchAppUpdate] = useReducer(appStateReducer, defaultAppState());

  const setupGameController = useCallback(
    async (initData: TownJoinResponse) => {
      await GameController(initData, dispatchAppUpdate);
      return true;
    },
    [dispatchAppUpdate],
  );
  const videoInstance = Video.instance();

  const { setOnDisconnect } = props;
  useEffect(() => {
    setOnDisconnect(() => async () => {
      // Here's a great gotcha: https://medium.com/swlh/how-to-store-a-function-with-the-usestate-hook-in-react-8a88dd4eede1
      dispatchAppUpdate({ action: 'disconnect' });
      return Video.teardown();
    });
  }, [dispatchAppUpdate, setOnDisconnect]);

  const page = useMemo(() => {
    if (!appState.authToken) {
      return <Login setLogin={(data) => dispatchAppUpdate({ action: 'doLogin', data: { authToken: data.authToken, userName: data.userName, userID: data.userID } })} />; 
    }
    if (!appState.sessionToken) {
      return <HomePage doLogin={setupGameController} />
    }
    if (!videoInstance) {
      return <div>Loading...</div>;
    }
    return (
      <div>
        <Grid templateRows='repeat(2, 1fr)' templateColumns='repeat(5,1fr)' gap={4}>
          <GridItem rowSpan={2} colSpan={1}>
            {' '}
            <WorldMap />{' '}
          </GridItem>
          <GridItem rowSpan={1} colSpan={4}>
            {' '}
            <ChatFeature />{' '}
          </GridItem>
          <GridItem rowSpan={2} colSpan={4}>
            {' '}
            <MeetingNotes />{' '}
          </GridItem>
        </Grid>

        <Grid>
          <GridItem>
            {' '}
            <VideoOverlay preferredMode='fullwidth' />{' '}
          </GridItem>
        </Grid>
      </div>
    );
  }, [setupGameController, appState.authToken, videoInstance, appState.sessionToken, appState.userName]);
  return (
    <CoveyAppContext.Provider value={appState}>
      <VideoContext.Provider value={Video.instance()}>
        <NearbyPlayersContext.Provider value={appState.nearbyPlayers}>
          {page}
        </NearbyPlayersContext.Provider>
      </VideoContext.Provider>
    </CoveyAppContext.Provider>
  );
}

function EmbeddedTwilioAppWrapper() {
  const { error, setError } = useAppState();
  const [onDisconnect, setOnDisconnect] = useState<Callback | undefined>();
  const connectionOptions = useConnectionOptions();
  return (
    <UnsupportedBrowserWarning>
      <VideoProvider options={connectionOptions} onError={setError} onDisconnect={onDisconnect}>
        <ErrorDialog dismissError={() => setError(null)} error={error} />
        <App setOnDisconnect={setOnDisconnect} />
      </VideoProvider>
    </UnsupportedBrowserWarning>
  );
}

export default function AppStateWrapper(): JSX.Element {
  return (
    <BrowserRouter>
      <ChakraProvider>
        <MuiThemeProvider theme={theme('rgb(185, 37, 0)')}>
          <AppStateProvider preferredMode='fullwidth' highlightedProfiles={[]}>
            <EmbeddedTwilioAppWrapper />
          </AppStateProvider>
        </MuiThemeProvider>
      </ChakraProvider>
    </BrowserRouter>
  );
}
