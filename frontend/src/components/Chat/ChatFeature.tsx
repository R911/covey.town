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
import Message from './Message';
import Video from '../../classes/Video/Video';

export default function ChatFeature(): JSX.Element {
  const [typedMessage, setTypedMessage] = useState<string>('');
  const [sentMessages, setChatMessages] = useState<Message>();
  const [participantToSendTo, setParticipantToSendTo] = useState<string>('');
  const [chatClient, setChatClient] = useState<ChatClient>();
  const [channel, setChannel] = useState<Channel>();

  // Get participants from backend
  const WholeGroup = 'Everyone';
  const sampleParticipants = ['Alice', 'Bob', 'Charles', 'Dave'];

  // Send messages to database
  // Will need to display messages cleaner
  // Need to send messages to only the participants checked in the checkbox
  function sendMessage(messageToSend: string) {
    const message: Message = new Message(messageToSend, participantToSendTo);
    setChatMessages(message);
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
      console.log(message.body);
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
          <Text fontSize='md' as='kbd'>
            {' '}
            {`To: ${sentMessages?.receivers}`}{' '}
          </Text>
          <Text fontSize='sm'> {sentMessages?.bodyOfMessage} </Text>
        </Box>

        <Box borderWidth='1px' borderRadius='lg'>
          <Stack>
            <Select
              placeholder='Send Message To: '
              onChange={event => setParticipantToSendTo(event.target.value)}
              value={participantToSendTo}>
              <option key='whole' value='Everyone'>
                {' '}
                {WholeGroup}{' '}
              </option>

              {sampleParticipants.map(participant => (
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
