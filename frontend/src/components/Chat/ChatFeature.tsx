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
import { Message as TwilioMessage } from 'twilio/lib/twiml/MessagingResponse';
import Video from '../../classes/Video/Video';
import useCoveyAppState from '../../hooks/useCoveyAppState';

export default function ChatFeature(): JSX.Element {
  const { apiClient, chatToken } = useCoveyAppState();
  const [typedMessage, setTypedMessage] = useState<string>('');
  const [messages, setMessages] = useState<TwilioMessage[]>([]);
  const [participants, setParticipants] = useState<string[]>();
  const [participantToSendTo, setParticipantToSendTo] = useState<string>();
  const [chatClient, setChatClient] = useState<ChatClient>();
  const [channel, setChannel] = useState<Channel>();
  const [userChatPrivilege, setUserChatPrivilege] = useState<boolean>(true);
  const [playerUserName, setUserName] = useState<string>(Video.instance()?.userName || '');


  const updateParticipantsListing = useCallback(() => {
    // console.log(apiClient);
    const videoInstance = Video.instance();
    const currentCoveyTownID = videoInstance?.coveyTownID;
    console.log(currentCoveyTownID);
    assert(currentCoveyTownID);

    apiClient.getParticipants({ coveyTownID: currentCoveyTownID }).then(players => {
      setParticipants(players.participants.sort().map(player => player._userName));
      console.log(players);
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
    channel?.sendMessage(`${playerUserName}: ${ messageToSend}`);
  }

  function onKeyDown(event: React.KeyboardEvent<HTMLDivElement>){
    if (event.key === 'Enter') {
      event.preventDefault();
      event.stopPropagation();
      sendMessage(typedMessage);
    }
  }

  function newMessageAlert(senderUsername: string) {
    const toast = createStandaloneToast();

    toast({
      title: `New Message From ${senderUsername}`,
      position: 'bottom-right',
      duration: 9000,
      isClosable: true,
    });
  }

  useEffect(() => {
    const createChatClient = async (cToken: string): Promise<ChatClient> => {
      const client = await ChatClient.create(cToken);
      return client;
      await setChatClient(() => client);
    };

    const handleMessageAdded = (message: TwilioMessage) => {
      // handles both the sent and received messages
      setMessages(arr => [...arr, message]);
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
      const cToken = videoInstance?.chatToken;
      assert(cToken);
      const client = await createChatClient(cToken);
      console.log(client);
      await setDefaultChannel(client);
    };
    setup();
  }, []);

  // Multi-Select Options
  const options = [{ value: '', label: '' }];

  participants?.forEach(participant => {
    options.push({ value: participant, label: participant });
  });

  return (
    <form>
      <Box borderWidth='1px' borderRadius='lg'>
        <Heading p='4' as='h2' size='md'>
          Chat
        </Heading>

        <Box borderWidth='1px' borderRadius='sm' w="100%" data-scrollbar='true' h={60}
            overflowY='scroll' overflowX='scroll'>
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
              variant="unstyled"
              options={options} 
            />
          </Stack>

          <Flex p='2'>
            <Input
              name='chatMessage'
              variant="unstyled"
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
              Send {' '}
            </Button>
          </Flex>
        </Box>
      </Box>
    </form>
  );
}
