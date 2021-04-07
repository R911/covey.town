import React, { Component, useCallback, useEffect, useState } from 'react';
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
import ChatClient from 'twilio-chat';
import assert from 'assert';
import { Channel } from 'twilio-chat/lib/channel';
import { Message } from 'twilio-chat/lib/message';
import Video from '../../classes/Video/Video';
import useCoveyAppState from '../../hooks/useCoveyAppState';
import { ServerPlayer } from '../../classes/Player';
import Chat from '../../classes/Chat/Chat';

export default function ChatFeature(): JSX.Element {
  const { apiClient, chatToken } = useCoveyAppState();
  const [typedMessage, setTypedMessage] = useState<string>('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [participants, setParticipants] = useState<ServerPlayer[]>();
  // const [participants, setParticipants] = useState<string[]>();
  const [participantsToSendTo, setParticipantsToSendTo] = useState<string[]>([]);
  const [chatClient, setChatClient] = useState<ChatClient>();
  const [channel, setChannel] = useState<Channel>();
  const [userChatPrivilege, setUserChatPrivilege] = useState<boolean>(true);
  const [playerUserName, setUserName] = useState<string>(Video.instance()?.userName || '');
  const chat = Chat.instance();
  const [coveyTownID, setCoveyTownID] = useState<string>('');

  function newMessageAlert(senderUsername: string) {
    const toast = createStandaloneToast();

    toast({
      title: `New Message From ${senderUsername}`,
      position: 'bottom-right',
      duration: 9000,
      isClosable: true,
    });
  }

  const handleMessageAdded = (message: Message) => {
    // handles both the sent and received messages
    setMessages(arr => [...arr, message]);
  };

  useEffect(() => {
    assert(chat);
    chat.handleChatMessageAdded = handleMessageAdded;
  }, [chat]);

  const updateParticipantsListing = useCallback(() => {
    // console.log(apiClient);
    const videoInstance = Video.instance();
    const currentCoveyTownID = videoInstance?.coveyTownID;
    assert(currentCoveyTownID);
    setCoveyTownID(currentCoveyTownID);

    apiClient.getParticipants({ coveyTownID: currentCoveyTownID }).then(players => {
      setParticipants(players.participants);

      // apiClient.getParticipants({ coveyTownID: currentCoveyTownID }).then(players => {
      // setParticipants(players.participants.sort().map(player => player._userName));
      // console.log(players);
    });
  }, [setParticipants, apiClient]);
  useEffect(() => {
    updateParticipantsListing();
    const timer = setInterval(updateParticipantsListing, 20000);
    return () => {
      clearInterval(timer);
    };
  }, [updateParticipantsListing]);

  // Need to send messages to only the participants checked in the checkbox
  function sendMessage(messageToSend: string) {
    setTypedMessage('');
    chat?.sendChatMessage(participantsToSendTo, `${playerUserName}: ${messageToSend}`);
  }

  function onKeyDown(event: React.KeyboardEvent<HTMLDivElement>) {
    if (event.key === 'Enter') {
      event.preventDefault();
      event.stopPropagation();
      sendMessage(typedMessage);
    }
  }

  // Multi-Select Options
  const options = [{ value: `${coveyTownID}`, label: 'Everyone' }];

  participants?.forEach(participant => {
    if (participant._userName !== playerUserName) {
      options.push({ value: participant._id, label: participant._userName });
    } 
  });

  async function handleChange(listOfParticipants: any[]) {
    setParticipantsToSendTo(listOfParticipants);
    assert(chat);
    const messageHistory = await chat.initChat(listOfParticipants, false);
    setMessages(messageHistory);
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
