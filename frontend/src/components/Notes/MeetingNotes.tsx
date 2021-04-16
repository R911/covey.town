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
  const { currentTownID, playerPrivileges } = useCoveyAppState();
  const [typedNote, setTypedNote] = useState<string>('');
  const [meetingNotes, setMeetingNotes] = useState<Message[]>([]);
  const [userMeetingPrivilege, setUserMeetingPrivilege] = useState<boolean>(true);
  const [playerUserName] = useState<string>(Video.instance()?.userName || '');
  const [chat] = useState<Chat>(Chat.instance());

  useEffect(() => {
    if (playerPrivileges!==undefined){
      setUserMeetingPrivilege(playerPrivileges.chat);
    }    
  }, [playerPrivileges]);

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
      const messageHistory = await chat.initChat([], {
        isMeetingNotes: true,
        isEveryoneChat: false,
        friendlyName: 'meeting-notes',
      });
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

    if (event.keyCode === 32) { 
      event.preventDefault();
      event.stopPropagation();
      setTypedNote(`${typedNote} `)
    }
  }

  /**
   * Saves the contents of meeting notes chat, into a text file and downloads it on the client.
   */
  function downloadNotes() {
    const messageList: string[] = [];
    meetingNotes.forEach(note => {
      messageList.push(note.body);
    });
    const element = document.createElement('a');
    const file = new Blob([messageList.join('\n')], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `${currentTownID}-notes.txt`;
    document.body.appendChild(element); // Required for this to work in FireFox
    element.click();
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
              onKeyDown={onKeyDown}
              value={typedNote}
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
            <Button data-testid='downloadButton' colorScheme='teal' onClick={downloadNotes}>
              {' '}
              Download{' '}
            </Button>
          </Flex>
        </Box>
      </Box>
    </form>
  );
}
