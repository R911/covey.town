import React, { useState } from 'react';
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
    useToast
  } from '@chakra-ui/react'; 
import { nanoid } from 'nanoid';

export default function MeetingNotes(): JSX.Element {
    const [typedNote, setTypedNote] = useState<string>('');
    const [meetingNotes, setMeetingNotes] = useState<string>('');

    function sendNote(noteToSend: string) {
        setMeetingNotes(` ${meetingNotes} ${noteToSend} `)
        setTypedNote('')
    }

    return (
        <form>
            <Box borderWidth="1px" borderRadius="lg">
                <Heading p="4" as="h2" size="lg">Meeting Notes</Heading>

                <Box borderWidth="1px" borderRadius="lg">
                    { meetingNotes }
                </Box>


                <Box borderWidth="1px" borderRadius="lg">
                    <Flex p="4">
                        <Input name="meetingNote" placeholder="Type here"
                               value={typedNote}
                               onChange={event => setTypedNote(event.target.value)}
                        />
                        <Button data-testid='sendMessageButton' 
                                colorScheme="teal"
                                onClick={() => sendNote(typedNote)}> Add to Notes </Button>
                    </Flex>
                </Box>
            </Box>
        </form>
    )
}