import React, { Component, useCallback, useEffect, useState } from 'react';
import {
  Box,
  Button,
  Checkbox,
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
import { Message } from 'twilio/lib/twiml/MessagingResponse';
import Video from '../../classes/Video/Video';

export default function ChatFeature(): JSX.Element {
  const [typedMessage, setTypedMessage] = useState<string>('');
  const [sentMessages, setChatMessages] = useState<string>('');
  const [chatClient, setChatClient] = useState<ChatClient>();
  const [channel, setChannel] = useState<Channel>();
  // Get participants from backend
  const sampleParticipants = ['Alice', 'Bob', 'Charles', 'Dave'];

  // Send messages to database
  // Will need to display messages cleaner
  // Need to send messages to only the participants checked in the checkbox
  function sendMessage(messageToSend: string) {
    setChatMessages(` ${sentMessages} ${messageToSend} `);
    setTypedMessage('');
    channel?.sendMessage(messageToSend);
  }

  useEffect(() => {
    const createChatClient = async (chatToken: string): Promise<ChatClient> => {
      const client = await ChatClient.create(chatToken);
      return client;
      await setChatClient(() => client);
    };

    const handleMessageAdded = (message: Message) => {
      console.log(message.body);
    };

    const joinChannel = async (newChannel: Channel) => {
      if (newChannel.status !== 'joined') {
        await newChannel.join();
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
      assert(chatToken);
      const client = await createChatClient(chatToken);
      console.log(client);
      await setDefaultChannel(client);
    };
    setup();
  }, [chatClient]);

  return (
    <form>
      <Box borderWidth='1px' borderRadius='lg'>
        <Heading p='4' as='h2' size='lg'>
          Chat
        </Heading>

        <Box borderWidth='1px' borderRadius='lg'>
          {sentMessages}
        </Box>

        <Stack pl={6} mt={1} spacing={1}>
          {sampleParticipants.map(participants => (
            <Checkbox key={nanoid()}> {participants} </Checkbox>
          ))}
        </Stack>

        <Box borderWidth='1px' borderRadius='lg'>
          <Flex p='4'>
            <Input
              name='chatMessage'
              placeholder='Type here'
              value={typedMessage}
              onChange={event => setTypedMessage(event.target.value)}
            />
            <Button
              data-testid='sendMessageButton'
              colorScheme='pink'
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
