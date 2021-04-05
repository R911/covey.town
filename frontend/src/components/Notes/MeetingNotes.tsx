import React, { useState, useEffect } from 'react';
import { Box, Button, Flex, Heading, Input, Text } from '@chakra-ui/react';
import { nanoid } from 'nanoid';
import ChatClient from 'twilio-chat';
import assert from 'assert';
import { Channel } from 'twilio-chat/lib/channel';
import { Message } from 'twilio-chat/lib/message';
import Video from '../../classes/Video/Video';
import Chat from '../../classes/Chat/Chat';

export default function MeetingNotes(): JSX.Element {
  const [typedNote, setTypedNote] = useState<string>('');
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
    assert(chat);

    const onNoteAdded = (message: Message): void => {
      setMeetingNotes(arr => [...arr, message]);
    };

    const initMeetingNotesChannel = async () => {
      const messageHistory = await chat.joinMeetingNotesChannel();
      setMeetingNotes(arr => arr.concat(messageHistory));
    };

    chat.handleMessageAdded = onNoteAdded;
    initMeetingNotesChannel();
  }, [chat]);

  function onKeyDown(event: React.KeyboardEvent<HTMLDivElement>) {
    if (event.key === 'Enter') {
      event.preventDefault();
      event.stopPropagation();
      sendNote(typedNote);
    }
  }

  return (
    <form>
      <Box borderWidth='1px' borderRadius='lg'>
        <Heading p='4' as='h2' size='md'>
          Meeting Notes
        </Heading>

        <Box
          borderWidth='1px'
          borderRadius='sm'
          w='100%'
          data-scrollbar='true'
          h={60}
          overflowY='scroll'
          overflowX='scroll'>
          {meetingNotes?.map(note => (
            <Text key={nanoid()} fontSize='sm'>
              {' '}
              {note.body}{' '}
            </Text>
          ))}
        </Box>

        <Box borderWidth='1px' borderRadius='sm'>
          <Flex p='2'>
            <Input
              name='meetingNote'
              variant='unstyled'
              placeholder='Type here'
              value={typedNote}
              onKeyDown={onKeyDown}
              onChange={event => setTypedNote(event.target.value)}
            />
            <Button
              data-testid='sendMessageButton'
              colorScheme='teal'
              disabled={!userMeetingPrivilege}
              onClick={() => sendNote(typedNote)}>
              {' '}
              Add Note{' '}
            </Button>
          </Flex>
        </Box>
      </Box>
    </form>
  );
}
