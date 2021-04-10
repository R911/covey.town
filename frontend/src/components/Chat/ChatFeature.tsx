import React, { useCallback, useEffect, useState } from 'react';
import {
  Box,
  Button,
  Flex,
  Heading,
  Input,
  Stack,
  Text,
  createStandaloneToast,
} from '@chakra-ui/react';
// npm i --save react-select
import Select from 'react-select';
import { nanoid } from 'nanoid';
import assert from 'assert';
import { Message } from 'twilio-chat/lib/message';
import Video from '../../classes/Video/Video';
import useCoveyAppState from '../../hooks/useCoveyAppState';
import { ServerPlayer } from '../../classes/Player';
import Chat from '../../classes/Chat/Chat';

/**
 * Chat feature where participants can send group chats, one-to-one chats, 
 * and whole group chats
 */
export default function ChatFeature(): JSX.Element {
  const { apiClient} = useCoveyAppState();
  const [typedMessage, setTypedMessage] = useState<string>('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [participants, setParticipants] = useState<ServerPlayer[]>();
  const [participantsToSendTo, setParticipantsToSendTo] = useState<string[]>([]);
  const [userChatPrivilege, setUserChatPrivilege] = useState<boolean>(true);
  const playerUserName = (Video.instance()?.userName || '');
  const chat = Chat.instance();
  const [coveyTownID, setCoveyTownID] = useState<string>('');

  useEffect(() => {
    /**
     * This function adds the new message to the current list of sent messages.
     * 
     * @param message Message to be sent out to recipients 
     */
    const handleMessageAdded = (message: Message) => {
      setMessages(arr => [...arr, message]);
    };

    /**
     * This function creates a new message alert that is sent to users to 
     * inform them of a new message.
     * 
     * @param message Message to be sent out to recipients
     */
    async function newMessageAlert(message: Message) {
      const toast = createStandaloneToast();
      let listenerString;
      if (participantsToSendTo[0] === coveyTownID) {
        listenerString = 'Everyone';
      } else {
        const listeners = await message.channel.getMembers();
        const listenerIDs = listeners.map(l => l.identity);
        listenerIDs.sort();
        listenerString = listenerIDs.join(',');
      }

      toast({
        title: `New Message From ${listenerString}`,
        position: 'bottom-right',
        duration: 9000,
        isClosable: true,
      });

      const participantIDs = participantsToSendTo;
      participantIDs.sort();
      const participantString = participantIDs.join('-');

      if (participantsToSendTo[0] === coveyTownID || listenerString === participantString) {
        handleMessageAdded(message);
      }
    }

    assert(chat);
    chat.handleChatMessageAdded = newMessageAlert;
  }, [chat, coveyTownID, participantsToSendTo]);

  /**
   * This function updates the list of participants who are currently in the town.
   * THe list of participants is displayed to users to pick from to send messages.
   */
  const updateParticipantsListing = useCallback(() => {
    const videoInstance = Video.instance();
    const currentCoveyTownID = videoInstance?.coveyTownID;
    assert(currentCoveyTownID);
    setCoveyTownID(currentCoveyTownID);

    apiClient.getParticipants({ coveyTownID: currentCoveyTownID }).then(players => {
      setParticipants(players.participants);
    });
  }, [setParticipants, apiClient]);
  useEffect(() => {
    updateParticipantsListing();
    const timer = setInterval(updateParticipantsListing, 5000);
    return () => {
      clearInterval(timer);
    };
  }, [updateParticipantsListing]);

  /**
   * This function uses the API to send the chat message.
   * 
   * @param messageToSend Message to be sent out to recipients 
   */
  function sendMessage(messageToSend: string) {
    setTypedMessage('');
    chat?.sendChatMessage(participantsToSendTo, `${playerUserName}: ${messageToSend}`);
  }

  /**
   * This function always users to send messages using the "Enter" button on 
   * the keyboard. 
   * 
   * @param event User event from keyboard
   */
  function onKeyDown(event: React.KeyboardEvent<HTMLDivElement>) {
    if (event.key === 'Enter') {
      event.preventDefault();
      event.stopPropagation();
      sendMessage(typedMessage);
    }
  }

  /**
   * Converts the current participants into a multi-select list for the chat.
   */
  const options = [{ value: `${coveyTownID}`, label: 'Everyone' }];
  participants?.forEach(participant => {
    if (participant._userName !== playerUserName) {
      options.push({ value: participant._id, label: participant._userName });
    }
  });

  /**
   * This function initiates a chat from the selected list of participants.
   * 
   * @param listOfParticipants participants to receive the current message
   */
  function handleChange(listOfParticipants: any[]) {
    async function loadChat() {
      setParticipantsToSendTo(() => listOfParticipants);
      assert(chat);
      const messageHistory = await chat.initChat(listOfParticipants, false);
      setMessages(messageHistory);
    }
    loadChat();
  }

  return (
    <form>
      <Box borderWidth='1px' borderRadius='lg'>
        <Heading p='4' as='h2' size='md'>
          Chat
        </Heading>

        <Box
          borderWidth='1px'
          borderRadius='sm'
          w='100%'
          data-scrollbar='true'
          h={60}
          overflowY='scroll'
          overflowX='scroll'>
          {messages?.map(message => (
            <Text key={nanoid()} fontSize='sm'>
              {' '}
              {message.body}{' '}
            </Text>
          ))}
        </Box>

        <Box borderWidth='1px' borderRadius='lg'>
          <Stack>
            <Select
              isMulti
              variant='unstyled'
              options={options}
              onChange={e => handleChange(Array.isArray(e) ? e.map(x => x.value) : [])}
            />
          </Stack>

          <Flex p='2'>
            <Input
              name='chatMessage'
              variant='unstyled'
              placeholder='Type here'
              onKeyDown={onKeyDown}
              value={typedMessage}
              onChange={event => setTypedMessage(event.target.value)}
            />
            <Button
              data-testid='sendMessageButton'
              colorScheme='teal'
              disabled={!userChatPrivilege}
              onClick={() => sendMessage(typedMessage)}>
              {' '}
              Send{' '}
            </Button>
          </Flex>
        </Box>
      </Box>
    </form>
  );
}