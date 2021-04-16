import { Socket } from 'socket.io-client';
import Player, { UserLocation, UserPrivileges } from './classes/Player';
import TownsServiceClient from './classes/TownsServiceClient';

export type CoveyEvent = 'playerMoved' | 'playerAdded' | 'playerRemoved';

export type VideoRoom = {
  twilioID: string;
  id: string;
};
export type UserProfile = {
  displayName: string;
  id: string;
};
export type NearbyPlayers = {
  nearbyPlayers: Player[];
};
export type CoveyAppState = {
  sessionToken: string;
  authToken: string;
  userID: string;
  userName: string;
  chatToken: string;
  currentTownFriendlyName: string;
  currentTownID: string;
  currentTownIsPubliclyListed: boolean;
  currentTownCapacity: number;
  myPlayerID: string;
  players: Player[];
  askedToBecomeAdmin: Player[];
  currentLocation: UserLocation;
  nearbyPlayers: NearbyPlayers;
  playerPrivileges: UserPrivileges|undefined,
  emitMovement: (location: UserLocation) => void;
  socket: Socket | null;
  apiClient: TownsServiceClient;
};

export type ChatConfig = {
  isMeetingNotes: boolean | null;
  isEveryoneChat: boolean | null;
  friendlyName: string;
};
