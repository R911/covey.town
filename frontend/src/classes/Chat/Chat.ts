import ChatClient from 'twilio-chat';
import { Channel } from 'twilio-chat/lib/channel';
import assert from 'assert';
import md5 from 'md5';
import { Message } from 'twilio-chat/lib/message';
import DebugLogger from '../DebugLogger';

export default class Chat {
  private static chat: Chat | null = null;

  private logger: DebugLogger = new DebugLogger('Chat');

  private _chatToken: string | null = null;

  private _chatClient: ChatClient | null = null;

  private _channelMap: Map<string, Channel> = new Map();

  private _userID: string | null = null;

  private _username: string | null = null;

  private _roomID: string | null = null;

  private _meetingNotesChannelID: string;

  private _handleMeetingNoteAdded: (message: Message) => void = () => {
    throw Error(
      'Meeting Note Added handler not set. Set this function using handleMessageAdded method',
    );
  };

  private _handleChatMessageAdded: (message: Message) => void = () => {
    throw Error('Message Added handler not set. Set this function using handleMessageAdded method');
  };

  private constructor(userID: string, userName: string, roomID: string, chatToken: string) {
    this._userID = userID;
    this._username = userName;
    this._roomID = roomID;
    this._chatToken = chatToken;
    this._meetingNotesChannelID = md5(`meeting-notes-${this._roomID}`);
  }

  public set handleMeetingNoteAdded(callback: (message: Message) => void) {
    this._handleMeetingNoteAdded = callback;
  }

  public set handleChatMessageAdded(callback: (message: Message) => void) {
    this._handleChatMessageAdded = callback;
  }

  private async setup(): Promise<ChatClient> {
    assert(this._chatToken);
    const client = await ChatClient.create(this._chatToken);
    assert(client);
    this._chatClient = client;
    this._chatClient.on('channelInvited', (channel: Channel) => {
      this.joinChannel(channel, false);
    });
    return client;
  }

  public static async setup(
    userID: string,
    userName: string,
    roomID: string,
    chatToken: string,
  ): Promise<void> {
    if (!Chat.chat) {
      Chat.chat = new Chat(userID, userName, roomID, chatToken);
      assert(Chat.chat);
    }

    try {
      const chatClient = await Chat.chat.setup();
      if (!chatClient) {
        Chat.chat = null;
        return;
      }
    } catch (err) {
      Chat.chat = null;
      throw err;
    }
  }

  public static instance(): Chat | null {
    return Chat.chat;
  }

  private async joinChannel(newChannel: Channel, isMeetingNotes: boolean): Promise<Channel> {
    if (newChannel.status !== 'joined') {
      await newChannel.join();
      if (isMeetingNotes) {
        newChannel.on('messageAdded', this._handleMeetingNoteAdded);
      } else {
        newChannel.on('messageAdded', this._handleChatMessageAdded);
      }
      this._channelMap.set(newChannel.uniqueName, newChannel);
    }
    return newChannel;
  }

  public sendMeetingNote(message: string): void {
    const meetingNotesChannel = this._channelMap.get(this._meetingNotesChannelID);
    if (!meetingNotesChannel) {
      throw Error('Meeting notes channel does not exist');
    }
    meetingNotesChannel.sendMessage(message);
  }

  public sendChatMessage(userIDs: string[], message: string): void {
    userIDs.sort();
    const joinedIDs = userIDs.join('-');
    const chatChannelUniqueName = md5(joinedIDs);

    const chatChannel = this._channelMap.get(chatChannelUniqueName);
    if (!chatChannel) {
      throw Error('Channel channel does not exist');
    }
    chatChannel.sendMessage(message);
  }

  public async initChat(userIDs: string[], isMeetingNotes: boolean): Promise<Message[]> {
    let chatChannelUniqueName = '';
    let chatChannelFriendlyName = '';
    let messageItems = [];

    if (isMeetingNotes) {
      chatChannelUniqueName = this._meetingNotesChannelID;
      chatChannelFriendlyName = 'meeting-notes';
    } else {
      userIDs.sort();
      const joinedIDs = userIDs.join('-');
      chatChannelFriendlyName = joinedIDs;
      chatChannelUniqueName = md5(joinedIDs);
    }

    let chatChannel;
    try {
      chatChannel = await this._chatClient?.getChannelByUniqueName(chatChannelUniqueName);
    } catch (error) {
      this.logger.error(error);
    } finally {
      if (!chatChannel) {
        chatChannel = await this._chatClient?.createChannel({
          friendlyName: chatChannelFriendlyName,
          uniqueName: chatChannelUniqueName,
        });
      }

      assert(chatChannel);
      const joinedChannel = await this.joinChannel(chatChannel, isMeetingNotes);
      userIDs.forEach(id => {
        joinedChannel.invite(id);
      });
      const messageHistory = await joinedChannel.getMessages();
      messageItems = messageHistory.items;
    }
    return messageItems;
  }
}
