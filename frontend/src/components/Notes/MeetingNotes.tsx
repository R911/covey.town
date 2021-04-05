import React, { useState, useEffect } from 'react';
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
  Text,
  Th,
  Thead,
  Tr,
  useToast,
} from '@chakra-ui/react';
import { nanoid } from 'nanoid';
import ChatClient from 'twilio-chat';
import assert from 'assert';
import { Channel } from 'twilio-chat/lib/channel';
import { Message } from 'twilio-chat/lib/message';
import Video from '../../classes/Video/Video';
import Chat from '../../classes/Chat/Chat';

export default function MeetingNotes(): JSX.Element {
  const [typedNote, setTypedNote] = useState<string>('');
  // const [meetingNotes, setMeetingNotes] = useState<string>('');
  const [meetingNotes, setMeetingNotes] = useState<Message[]>([]);
  const [chatClient, setChatClient] = useState<ChatClient>();
  const [channel, setChannel] = useState<Channel>();
  const [userMeetingPrivilege, setUserMeetingPrivilege] = useState<boolean>(true);
  const [playerUserName, setUserName] = useState<string>(Video.instance()?.userName || '');
  const chat = Chat.instance();

  function sendNote(noteToSend: string) {
    setTypedNote('');
    chat?.sendMeetingNote(`${playerUserName}: ${noteToSend}`);
  }

  useEffect(() => {
    console.log('Client', chat);
    assert(chat);
    const onNoteAdded = (message: Message): void => {
      console.log(`Note: ${message}`);
      setMeetingNotes(arr => [...arr, message]);
      console.log(`Meeting Notes: ${meetingNotes}`);
    };
    chat.handleMessageAdded = onNoteAdded;
  }, []);

  // useEffect(() => {
  //     const createChatClient = async (chatToken: string): Promise<ChatClient> => {
  //       const client = await ChatClient.create(chatToken);
  //       return client;
  //     };

  //     const handleNoteAdded = (note: TwilioMessage) => {
  //       // handles both the sent and received messages
  //       console.log(`Note: ${note}`)
  //       setMeetingNotes(arr => [...arr, note])
  //       console.log(`Meeting Notes: ${meetingNotes}`)
  //     };

  //     const joinChannel = async (newMeetingChannel: Channel) => {
  //       if (newMeetingChannel.status !== 'joined') {
  //         await newMeetingChannel.join();
  //         const messageList = (await newMeetingChannel.getMessages()).items;
  //         messageList.forEach(message => {
  //           console.log(message.body);
  //         });
  //       }
  //       newMeetingChannel.on('messageAdded', handleNoteAdded);
  //     };

  //     const setDefaultChannel = async (client: ChatClient) => {
  //       try {
  //         const defaultChannel = await client.getChannelByUniqueName('meeting-notes');
  //         await joinChannel(defaultChannel);
  //         await setChannel(defaultChannel);
  //       } catch (err) {
  //         const newChannel = await client.createChannel({
  //           uniqueName: 'meeting-notes',
  //           friendlyName: 'meeting-notes',
  //         });
  //         setChannel(newChannel);
  //         assert(newChannel);
  //         await joinChannel(newChannel);
  //         console.log('channelMeetingNotes', channel);
  //       }
  //     };

  //     const setup = async () => {
  //       const videoInstance = Video.instance();
  //       const chatToken = videoInstance?.chatToken;
  //       console.log(chatToken);
  //       assert(chatToken);
  //       const client = await createChatClient(chatToken);
  //       console.log(client);
  //       await setDefaultChannel(client);
  //     };
  //     setup();
  //   }, [chatClient]);

  return (
    <form>
      <Box borderWidth='1px' borderRadius='lg'>
        <Heading p='4' as='h2' size='lg'>
          Meeting Notes
        </Heading>

        <Box borderWidth='1px' borderRadius='lg'>
          {meetingNotes?.map(note => (
            <Text key={nanoid()} fontSize='sm'>
              {' '}
              {note.body}{' '}
            </Text>
          ))}
        </Box>

        <Box borderWidth='1px' borderRadius='lg'>
          <Flex p='4'>
            <Input
              name='meetingNote'
              placeholder='Type here'
              value={typedNote}
              onChange={event => setTypedNote(event.target.value)}
            />
            <Button
              data-testid='sendMessageButton'
              colorScheme='teal'
              disabled={!userMeetingPrivilege}
              onClick={() => sendNote(typedNote)}>
              {' '}
              Add to Notes{' '}
            </Button>
          </Flex>
        </Box>
      </Box>
    </form>
  );
}
