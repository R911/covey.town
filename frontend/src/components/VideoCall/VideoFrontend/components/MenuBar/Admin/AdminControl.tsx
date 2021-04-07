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
  CheckboxGroup,
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
  const {currentTownID, currentTownFriendlyName, currentTownIsPubliclyListed, players} = useCoveyAppState();

  const openSettings = useCallback(()=>{
    onOpen();
    video?.pauseGame();
  }, [onOpen, video]);

  const closeSettings = useCallback(()=>{
    onClose();
    video?.unPauseGame();
  }, [onClose, video]);

  return <>
    <MenuItem data-testid='openMenuButton' onClick={openSettings}>
      <Typography variant="body1">Admin Controls</Typography>
    </MenuItem>
    <Modal isOpen={isOpen} onClose={closeSettings} size="6xl">
      <ModalOverlay/>
      <ModalContent>
        <ModalHeader>Admin Controls for {currentTownFriendlyName} ({currentTownID})</ModalHeader>
        <ModalCloseButton/>        
          <ModalBody pb={6}>
          <Table>
                <Thead><Tr><Th>User Name</Th><Th>User ID</Th><Th>Type</Th><Th>Ban/Kick</Th><Th>Modify</Th></Tr></Thead>
                <Tbody>
                  {players?.map((player) => (
                    <Tr key={player.id}><Td role='cell'>{player.userName}</Td><Td
                      role='cell'>{player.id}</Td>
                      <Td role='cell'>{player.privilages?.admin?'Admin': 'Attendee'}</Td>
                      <Td role="cell"> 
                        <Button colorScheme="red" size="md"> Ban </Button>
                      </Td>
                        <Td role='cell'>
                        <Button onClick={onToggle}>Modify Privileges</Button>
                        <Collapse in={isOpen} animateOpacity>
                          <Box>
                            <HStack>
                              <Checkbox isChecked={!player.privilages?.video}>Disable Video</Checkbox>
                              <Checkbox isChecked={!player.privilages?.audio}>Disable Audio</Checkbox>
                              <Checkbox isChecked={!player.privilages?.chat}>Disable Chat</Checkbox>
                              <Checkbox isChecked={player.privilages?.admin}>Make Admin</Checkbox>
                            </HStack>
                          </Box>
                        </Collapse>
                        </Td></Tr>
                  ))}
                </Tbody>
              </Table>
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="red" size="md" mr={6}>Empty Town</Button>
            <Button onClick={closeSettings}>Close</Button>
          </ModalFooter>
      </ModalContent>
    </Modal>
  </>
}


export default AdminControl;
