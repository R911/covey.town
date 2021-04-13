import React, { useState, useEffect } from 'react';
import { Box, Button, Flex, Heading, Input, Text } from '@chakra-ui/react';
import { nanoid } from 'nanoid';
import assert from 'assert';
import { Message } from 'twilio-chat/lib/message';
import Video from '../../classes/Video/Video';
import Chat from '../../classes/Chat/Chat';
import useCoveyAppState from '../../hooks/useCoveyAppState';

/**
 * Meeting notes feature where participants can add notes that can be accessed by
 * all users in the town.
 */
export default function MeetingNotes(): JSX.Element {
  const {players, myPlayerID} = useCoveyAppState();
  const [typedNote, setTypedNote] = useState<string>('');
  const [meetingNotes, setMeetingNotes] = useState<Message[]>([]);
  const [userMeetingPrivilege, setUserMeetingPrivilege] = useState<boolean>(true);
  const [playerUserName] = useState<string>(Video.instance()?.userName || '');
  const [chat] = useState<Chat>(Chat.instance());

  useEffect(() => {
    let chatPrivilege = players.find(player => player.id === myPlayerID)?.privileges?.chat;
    if (!chatPrivilege) {
      chatPrivilege = true;
    }
    setUserMeetingPrivilege(chatPrivilege);
  }, [players, myPlayerID]);


  /**
   * This function uses the API to send the meeting note.
   * 
   * @param noteToSend Notes to be sent out to town
   */
  function sendNote(noteToSend: string) {
    setTypedNote('');
    chat.sendMeetingNote(`${playerUserName}: ${noteToSend}`);
  }

  useEffect(() => {
    assert(chat);
     /**
     * This function adds the new meeting note to the current list of notes.
     * 
     * @param message Meeting note to be sent out to recipients 
     */
    const onNoteAdded = (message: Message): void => {
      setMeetingNotes(arr => [...arr, message]); 
    };

    const initMeetingNotesChannel = async () => {
      const messageHistory = await chat.initChat([], true);
      setMeetingNotes(arr => arr.concat(messageHistory));
    };

    chat.handleMeetingNoteAdded = onNoteAdded;
    initMeetingNotesChannel();
  }, [chat]);

  /**
   * This function always users to send meeting note using the "Enter" button on 
   * the keyboard. 
   * 
   * @param event User event from keyboard
   */
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
            <Button
              data-testid='downloadButton'
              colorScheme='teal'
              // onClick={}
              >
              {' '}
              Download {' '}
            </Button>
          </Flex>
        </Box>
      </Box>
    </form>
  );
}
