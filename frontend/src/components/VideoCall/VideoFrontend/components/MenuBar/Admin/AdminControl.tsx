import React, { useCallback, useState } from 'react';

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

const AdminControl: React.FunctionComponent = () => {
  const {isOpen, onOpen, onClose, onToggle} = useDisclosure()
  const video = useMaybeVideo()
  const {currentTownID, currentTownFriendlyName, myPlayerID, players, apiClient} = useCoveyAppState();
  const [townPassword, setTownPassword] = useState<string>('');
  const [userPassword, setUserPassword] = useState<string>('');
  const [audioPrivilege, setAudioPrivilege] = useState<boolean>(true);
  const [videoPrivilege, setVideoPrivilege] = useState<boolean>(true);
  const [chatPrivilege, setChatPrivilege] = useState<boolean>(true);
  const [isAdmin, setAdmin] = useState<boolean>(false);

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

  const handleModifyPlayer = async (playerId: string) => {
    try {
      await apiClient.modifyPlayer({coveyTownID:currentTownID, coveyTownPassword: townPassword,userId:myPlayerID, userPassword:userPassword, playerId, isAdmin, audioAccess:audioPrivilege, videoAccess:videoPrivilege, chatAccess: chatPrivilege});
    } catch (err) {
      toast({
        title: 'Unable to connect to Towns Service',
        description: err.toString(),
        status: 'error'
      })
    }
  };



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
                <Thead><Tr><Th>User Name</Th><Th>User ID</Th><Th>Type</Th><Th>Ban/Kick</Th><Th>Modify</Th></Tr></Thead>
                <Tbody>
                  {players?.map((player) => (
                    <Tr key={player.id}><Td role='cell'>{player.userName}</Td><Td
                      role='cell'>{player.id}</Td>
                      <Td role='cell'>{player.privilages?.admin?'Admin': 'Attendee'}</Td>
                      <Td role="cell"> 
                        <Button colorScheme="red" size="md" onClick={() => handleBan(player.id)}>Ban</Button>
                      </Td>
                        <Td role='cell'>
                          <Box>
                            <HStack>
                              <Checkbox colorScheme="green" onChange={(e) => {setVideoPrivilege(e.target.checked)}} isChecked={videoPrivilege}>Video</Checkbox>
                              <Checkbox colorScheme="green" onChange={(e) => {setAudioPrivilege(e.target.checked)}} isChecked={audioPrivilege}>Audio</Checkbox>
                              <Checkbox colorScheme="green" onChange={(e) => {setChatPrivilege(e.target.checked)}} isChecked={chatPrivilege}>Chat</Checkbox>
                              <Checkbox colorScheme="green" onChange={(e) => {setAdmin(e.target.checked)}} isChecked={isAdmin}>Make Admin</Checkbox>
                              <Button onClick={()=>handleModifyPlayer(player.id)}>Modify</Button>
                            </HStack>
                          </Box>
                        </Td></Tr>
                  ))}
                </Tbody>
              </Table>
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="red" size="md" mr={6} onClick={() => handleEmptyTown()}>Empty Town</Button>
            <Button onClick={closeSettings}>Close</Button>
          </ModalFooter>
      </ModalContent>
    </Modal>
    </form>
  </>
}


export default AdminControl;
