import React, { useCallback, useEffect, useState } from 'react';
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

export default function ChatFeature(): JSX.Element {
    const [typedMessage, setTypedMessage] = useState<string>('');
    const [sentMessages, setChatMessages] = useState<string>('');


    // Get participants from backend
    const sampleParticipants = ['Alice', 'Bob', 'Charles',  'Dave']

    // Send messages to database 
    // Will need to display messages cleaner
    // Need to send messages to only the participants checked in the checkbox
    function sendMessage(messageToSend: string) {
        setChatMessages(` ${sentMessages} ${messageToSend} `)
        setTypedMessage('')
    }

    return (
        <form>
            <Box borderWidth="1px" borderRadius="lg">
                <Heading p="4" as="h2" size="lg">Chat</Heading>

                <Box borderWidth="1px" borderRadius="lg">
                    { sentMessages }
                </Box>

                <Stack pl={6} mt={1} spacing={1}>
                    { sampleParticipants.map(
                        (participants) => <Checkbox key={ nanoid() }> {participants} </Checkbox>)}
                </Stack>

                <Box borderWidth="1px" borderRadius="lg">
                    <Flex p="4">
                        <Input name="chatMessage" placeholder="Type here"
                               value={typedMessage}
                               onChange={event => setTypedMessage(event.target.value)}
                        />
                        <Button data-testid='sendMessageButton' 
                                colorScheme="pink"
                                onClick={() => sendMessage(typedMessage)}> Send </Button>
                    </Flex>
                </Box>
            </Box>
        </form>
    )
}