import React, { Component, useCallback, useEffect, useState } from 'react';
import {
  Box,
  Button,
  Checkbox,
  Divider,
  Flex,
  FormControl,
  FormLabel,
  Heading,
  Input,
  Select,
  Stack,
  Table,
  TableCaption,
  Tbody,
  Text,
  Td,
  Th,
  Thead,
  Tr,
  useToast,
} from '@chakra-ui/react';
import { nanoid } from 'nanoid';
import ChatClient from 'twilio-chat';
import assert from 'assert';
import { Channel } from 'twilio-chat/lib/channel';
import { Message as TwilioMessage } from 'twilio/lib/twiml/MessagingResponse';
import Video from '../../classes/Video/Video';
import useCoveyAppState from '../../hooks/useCoveyAppState';
import { ServerPlayer } from '../../classes/Player';
// import { ServerPlayer, TownParticipantsResponse, } from '../../classes/TownsServiceClient';

export default function ChatFeature(): JSX.Element {
  const { apiClient } = useCoveyAppState();
  const [typedMessage, setTypedMessage] = useState<string>('');
  // const [sentMessages, setChatMessages] = useState<Message>();
  const [messages, setMessages] = useState<TwilioMessage[]>([]);
  const [participants, setParticipants] = useState<string[]>();
  const [participantToSendTo, setParticipantToSendTo] = useState<string>();
  // const [participants, setParticipants] = useState<ServerPlayer[]>();
  const [chatClient, setChatClient] = useState<ChatClient>();
  const [channel, setChannel] = useState<Channel>();

  // Get participants from backend
  const WholeGroup = 'Everyone';
  const sampleParticipants = ['Alice', 'Bob', 'Charles', 'Dave'];

  const updateParticipantsListing = useCallback(() => {
    // console.log(apiClient);
    const videoInstance = Video.instance();
    const currentCoveyTownID = videoInstance?.coveyTownID;
    console.log(currentCoveyTownID);
    assert(currentCoveyTownID);

    apiClient.getParticipants({coveyTownID: currentCoveyTownID})
      .then((players) => {
        setParticipants(players.participants.sort().map(player => player._userName))
        console.log(players)
        // setParticipants(players.currentPlayers) 
      })
  }, [setParticipants, apiClient]);
  useEffect(() => {
    updateParticipantsListing();
    const timer = setInterval(updateParticipantsListing, 20000);
    return () => {
      clearInterval(timer)
    };
  }, [updateParticipantsListing]);

  // Send messages to database
  // Will need to display messages cleaner
  // Need to send messages to only the participants checked in the checkbox
  function sendMessage(messageToSend: string) {
   // const message: Message = new Message(messageToSend, participantToSendTo);
   // setChatMessages(message);
    setTypedMessage('');
    channel?.sendMessage(messageToSend);
  }

  useEffect(() => {
    const createChatClient = async (chatToken: string): Promise<ChatClient> => {
      const client = await ChatClient.create(chatToken);
      return client;
      await setChatClient(() => client);
    };

    const handleMessageAdded = (message: TwilioMessage) => {
      // handles both the sent and received messages  
      setMessages(arr => [...arr, message])
    };

    const joinChannel = async (newChannel: Channel) => {
      if (newChannel.status !== 'joined') {
        await newChannel.join();
        const messageList = (await newChannel.getMessages()).items;
        messageList.forEach(message => {
          console.log(message.body);
        });
      }
      newChannel.on('messageAdded', handleMessageAdded);
    };

    const setDefaultChannel = async (client: ChatClient) => {
      try {
        const defaultChannel = await client.getChannelByUniqueName('general');
        await joinChannel(defaultChannel);
        await setChannel(defaultChannel);
      } catch (err) {
        const newChannel = await client.createChannel({
          uniqueName: 'general',
          friendlyName: 'general',
        });
        setChannel(newChannel);
        assert(newChannel);
        await joinChannel(newChannel);
        console.log('channel', channel);
      }
    };

    const setup = async () => {
      const videoInstance = Video.instance();
      const chatToken = videoInstance?.chatToken;
      console.log(chatToken);
      assert(chatToken);
      const client = await createChatClient(chatToken);
      console.log(client);
      await setDefaultChannel(client);
    };
    setup();
  }, [chatClient]);

  return (
    <form>
      <Divider orientation='horizontal' />
      <Box borderWidth='1px' borderRadius='lg'>
        <Heading bg='teal' p='4' as='h2' size='lg'>
          Chat
        </Heading>

        <Box borderWidth='1px' borderRadius='lg' data-scrollbar='true'>
          {messages?.map(message => (<Text key={nanoid()} fontSize='sm'> {message.body} </Text>))}
        </Box>

        <Box borderWidth='1px' borderRadius='lg'>
          <Stack>
            <Select
              placeholder='Send Message To: '
              onChange={event => setParticipantToSendTo(event.target.value)}
              value={participantToSendTo}
              >
              <option key='whole' value='Everyone'>
                {' '}
                {WholeGroup}{' '}
              </option>

              {participants?.map(participant => (
                <option key={nanoid()} value={participant}>
                  {' '}
                  {participant}{' '}
                </option>
              ))}
            </Select>
          </Stack>

          <Flex p='4'>
            <Input
              name='chatMessage'
              placeholder='Type here'
              value={typedMessage}
              onChange={event => setTypedMessage(event.target.value)}
            />
            <Button
              data-testid='sendMessageButton'
              colorScheme='teal'
              onClick={() => sendMessage(typedMessage)}>
              {' '}
              Send Message{' '}
            </Button>
          </Flex>
        </Box>
      </Box>

      <Divider orientation='horizontal' />
    </form>
  );
}
