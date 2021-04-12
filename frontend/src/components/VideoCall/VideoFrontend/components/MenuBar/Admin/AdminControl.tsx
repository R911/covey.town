import React, { useCallback, useState, useEffect } from 'react';

import {
  Button,
  Table,
  TableCaption,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Collapse,
  FormControl,
  FormLabel,
  Input,
  Checkbox,
  Box,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  useDisclosure,
  useToast,
  HStack
} from '@chakra-ui/react';
import MenuItem from '@material-ui/core/MenuItem';
import Typography from '@material-ui/core/Typography';
import useCoveyAppState from '../../../../../../hooks/useCoveyAppState';
import useMaybeVideo from '../../../../../../hooks/useMaybeVideo';
import Player from '../../../../../../classes/Player';
import {PlayerUpdateRequest} from '../../../../../../classes/TownsServiceClient';

const AdminControl: React.FunctionComponent = () => {
  const {isOpen, onOpen, onClose, onToggle} = useDisclosure()
  const video = useMaybeVideo()
  const {currentTownID, currentTownFriendlyName, myPlayerID, players, apiClient} = useCoveyAppState();
  const [townPassword, setTownPassword] = useState<string>('');
  const [userPassword, setUserPassword] = useState<string>('');
  const [privilegeMap, setPrivilegeMap] = useState(new Map<string, Player| undefined>());

  const toast = useToast();

  const openSettings = useCallback(()=>{
    onOpen();
    video?.pauseGame();
  }, [onOpen, video]);

  const closeSettings = useCallback(()=>{
    onClose();
    video?.unPauseGame();
  }, [onClose, video]);

  const handleBan = async (playerId: string) => {
    try {
      console.log(townPassword);
      console.log(userPassword);
      await apiClient.banPlayer({coveyTownID:currentTownID, coveyTownPassword:townPassword, userId:myPlayerID, userPassword:userPassword, playerId});
    } catch (err) {
      toast({
        title: 'Unable to connect to Towns Service',
        description: err.toString(),
        status: 'error'
      })
    }
  };

  const handleEmptyTown = async () => {
    try {
      await apiClient.emptyTown({coveyTownID:currentTownID, coveyTownPassword:townPassword, userId:myPlayerID, userPassword:userPassword});
    } catch (err) {
      toast({
        title: 'Unable to connect to Towns Service',
        description: err.toString(),
        status: 'error'
      })
    }
  };

  const handlePlayerModify = async (playerUpdate: PlayerUpdateRequest) => {
    try {
      await apiClient.modifyPlayer(playerUpdate);
    } catch (err) {
      toast({
        title: 'Unable to modify player',
        description: err.toString(),
        status: 'error'
      })
    }
  };

  const handleAudioBan = async (playerId: string) => {
    handlePlayerModify({coveyTownID:currentTownID, coveyTownPassword: townPassword,userId:myPlayerID, userPassword:userPassword, playerId, audioAccess:false});
  };

  const handleVideoBan = async (playerId: string) => {
    handlePlayerModify({coveyTownID:currentTownID, coveyTownPassword: townPassword,userId:myPlayerID, userPassword:userPassword, playerId, videoAccess:false});
  };

  const handleChatBan = async (playerId: string) => {
    handlePlayerModify({coveyTownID:currentTownID, coveyTownPassword: townPassword,userId:myPlayerID, userPassword:userPassword, playerId, chatAccess:false});
  };

  const promoteToAdmin = async (playerId: string) => {
    handlePlayerModify({coveyTownID:currentTownID, coveyTownPassword: townPassword,userId:myPlayerID, userPassword:userPassword, playerId, isAdmin:true});
  };

  const handleAllAudioBan = async () => {
    players.map((player)=>{handlePlayerModify({coveyTownID:currentTownID, coveyTownPassword: townPassword,userId:myPlayerID, userPassword:userPassword, playerId: player.id, audioAccess:false});});
  };

  const handleAllVideoBan = async () => {
    players.map((player)=>{handlePlayerModify({coveyTownID:currentTownID, coveyTownPassword: townPassword,userId:myPlayerID, userPassword:userPassword, playerId: player.id, videoAccess:false});});
  };

  const handleAllChatBan = async () => {
    players.map((player)=>{handlePlayerModify({coveyTownID:currentTownID, coveyTownPassword: townPassword,userId:myPlayerID, userPassword:userPassword, playerId: player.id, chatAccess:false});});
  };

  useEffect(() => {
    players?.map((player) => {
      setPrivilegeMap(privilegeMap.set(player.id, player));
      console.log(player);
    });
  },[players]);

  return <>
    <form>
    <MenuItem data-testid='openMenuButton' onClick={openSettings}>
      <Typography variant="body1">Admin Controls</Typography>
    </MenuItem>
    <Modal isOpen={isOpen} onClose={closeSettings} size="6xl">
      <ModalOverlay/>
      <ModalContent>
        <ModalHeader>Admin Controls for {currentTownFriendlyName} ({currentTownID})</ModalHeader>
        <ModalCloseButton/>        
          <ModalBody pb={6}>
          <FormControl>
              <FormLabel htmlFor="townPassword">Town Password</FormLabel>
              <Input id="townPassword" autoFocus name="townPassword" placeholder="Town Password"
                     value={townPassword}
                     onChange={(event) => setTownPassword(event.target.value) } type="password"
              />
              <FormLabel htmlFor="userPassword">Your Password</FormLabel>
              <Input id="userPassword" autoFocus name="userPassword" placeholder="Your Password"
                     value={userPassword}
                     onChange={(event) => setUserPassword(event.target.value) } type="password"
              />
            </FormControl>
          <Table>
                <Thead><Tr><Th>User Name</Th><Th>User ID</Th><Th>Type</Th><Th>Ban/Kick</Th><Th>Disable Controls</Th><Th>Promote</Th></Tr></Thead>
                <Tbody>
                  {players?.map((player) => (
                    <Tr key={player.id}><Td role='cell'>{player.userName}</Td><Td
                      role='cell'>{player.id}</Td>
                      <Td role='cell'>{player.privileges?.admin?'Admin': 'Attendee'}</Td>
                      <Td role="cell"> 
                        <Button colorScheme="red" size="md" onClick={() => handleBan(player.id)}>Ban</Button>
                      </Td>
                        <Td role='cell'>
                          <Box>
                            <HStack>
                              <Button colorScheme={privilegeMap.get(player.id)?.privileges?.video?'green':'red'} onClick={()=> handleVideoBan(player.id)} >Video</Button>
                              <Button colorScheme={privilegeMap.get(player.id)?.privileges?.audio?'green':'red'} onClick={()=> handleAudioBan(player.id)} >Audio</Button>
                              <Button colorScheme={privilegeMap.get(player.id)?.privileges?.chat?'green':'red'} onClick={()=> handleChatBan(player.id)} >Chat</Button>
                            </HStack>
                          </Box>
                        </Td>
                        <Td role="cell">
                          <Button colorScheme={privilegeMap.get(player.id)?.privileges?.admin?'green':'gray'} onClick={()=>promoteToAdmin(player.id)}>Make Admin</Button>
                        </Td>
                        </Tr>
                  ))}
                </Tbody>
              </Table>
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="red" size="md" mr={6} onClick={() => handleEmptyTown()}>Empty Town</Button>
            <Button colorScheme="red" size="md" mr={6} onClick={() => handleAllAudioBan()}>Mute All</Button>
            <Button colorScheme="red" size="md" mr={6} onClick={() => handleAllVideoBan()}>Disable All Video</Button>
            <Button colorScheme="red" size="md" mr={6} onClick={() => handleAllChatBan()}>Disable All Chat</Button>
            <Button onClick={closeSettings}>Close</Button>
          </ModalFooter>
      </ModalContent>
    </Modal>
    </form>
  </>
}


export default AdminControl;
