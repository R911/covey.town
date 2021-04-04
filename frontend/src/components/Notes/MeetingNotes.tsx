import React, { useState, useEffect } from 'react';
import {
    Box,
    Button,
    Flex,
    Heading,
    Input,
  } from '@chakra-ui/react'; 
import { nanoid } from 'nanoid';
import ChatClient from 'twilio-chat';
import assert from 'assert';
import { Channel } from 'twilio-chat/lib/channel';
import { Message as TwilioMessage } from 'twilio/lib/twiml/MessagingResponse';
import Video from '../../classes/Video/Video';

export default function MeetingNotes(): JSX.Element {
    const [typedNote, setTypedNote] = useState<string>(''); 
    const [meetingNotes, setMeetingNotes] = useState<TwilioMessage[]>([]);
    const [chatClient, setChatClient] = useState<ChatClient>();
    const [channel, setChannel] = useState<Channel>();
    const [userMeetingPrivilege, setUserMeetingPrivilege] = useState<boolean>(true);
    const [playerUserName, setUserName] = useState<string>(Video.instance()?.userName || '');

    function sendNote(noteToSend: string) {
        setTypedNote('')
        channel?.sendMessage(`${playerUserName}: ${ noteToSend}`);
    }

    function onKeyDown(event: React.KeyboardEvent<HTMLDivElement>){
        if (event.key === 'Enter') {
          event.preventDefault();
          event.stopPropagation();
          sendNote(typedNote);
        }
      }

    useEffect(() => {
        const createChatClient = async (chatToken: string): Promise<ChatClient> => {
          const client = await ChatClient.create(chatToken);
          return client;
          await setChatClient(() => client);
        };
    
        const handleNoteAdded = (note: TwilioMessage) => {
          // handles both the sent and received messages  
          console.log(`Note: ${note}`)
          setMeetingNotes(arr => [...arr, note])
          console.log(`Meeting Notes: ${meetingNotes}`)
        };
    
        const joinChannel = async (newMeetingChannel: Channel) => {
          if (newMeetingChannel.status !== 'joined') {
            await newMeetingChannel.join();
            const messageList = (await newMeetingChannel.getMessages()).items;
            messageList.forEach(message => {
              console.log(message.body);
            });
          }
          newMeetingChannel.on('messageAdded', handleNoteAdded);
        };
    
        const setDefaultChannel = async (client: ChatClient) => {
          try {
            const defaultChannel = await client.getChannelByUniqueName('meeting-notes');
            await joinChannel(defaultChannel);
            await setChannel(defaultChannel);
          } catch (err) {
            const newChannel = await client.createChannel({
              uniqueName: 'meeting-notes',
              friendlyName: 'meeting-notes',
            });
            setChannel(newChannel);
            assert(newChannel);
            await joinChannel(newChannel);
            console.log('channelMeetingNotes', channel);
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
            <Box borderWidth="1px" borderRadius="lg">
                <Heading p="4" as="h2" size="md">Meeting Notes</Heading>

                <Box borderWidth="1px" borderRadius="sm" w="100%" data-scrollbar='true' h={60}
                    overflowY='scroll' overflowX='scroll'>
                    { meetingNotes?.map(note => (
                        <Text key={nanoid()} fontSize='sm'> { note.body } </Text>
                    ))}
                </Box>

                <Box borderWidth="1px" borderRadius="sm">
                    <Flex p="2">
                        <Input name="meetingNote" 
                               variant="unstyled"
                               placeholder="Type here"
                               value={typedNote}
                               onKeyDown={onKeyDown}
                               onChange={event => setTypedNote(event.target.value)}
                        />
                        <Button data-testid='sendMessageButton' 
                                colorScheme="teal"
                                disabled={!userMeetingPrivilege}
                                onClick={() => sendNote(typedNote)}> Add Note </Button>
                    </Flex>
                </Box>
            </Box>
        </form>
    )
}