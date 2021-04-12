import ChatClient from 'twilio-chat';
import { Channel } from 'twilio-chat/lib/channel';
import assert from 'assert';
import md5 from 'md5';
import { Message } from 'twilio-chat/lib/message';
import DebugLogger from '../DebugLogger';

export default class Chat {
  private static chat: Chat;

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
    console.log('Callback set');
  }

  private async setup(): Promise<ChatClient> {
    assert(this._chatToken);
    const client = await ChatClient.create(this._chatToken);
    assert(client);
    this._chatClient = client;
    this._chatClient.on('channelInvited', (channel: Channel) => {
      console.log('Invited to channel', channel.uniqueName);
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
    } catch (err) {
      console.error(err);
      throw err;
    }
  }

  public static instance(): Chat {
    return Chat.chat;
  }

  private async joinChannel(newChannel: Channel, isMeetingNotes: boolean): Promise<Channel> {
    if (newChannel.status !== 'joined') {
      await newChannel.join();
      console.log('Joined channel', newChannel.uniqueName);
    }
    if (isMeetingNotes) {
      newChannel.on('messageAdded', this._handleMeetingNoteAdded);
    } else {
      newChannel.on('messageAdded', this._handleChatMessageAdded);
    }
    this._channelMap.set(newChannel.uniqueName, newChannel);
    return newChannel;
  }

  public sendMeetingNote(message: string): void {
    const meetingNotesChannel = this._channelMap.get(this._meetingNotesChannelID);
    if (!meetingNotesChannel) {
      throw Error('Meeting notes channel does not exist');
    }
    meetingNotesChannel.sendMessage(message);
  }

  public sendChatMessage(userNames: string[], message: string): void {
    console.log(userNames);
    assert(this._username);
    userNames.push(this._username);
    userNames.sort();
    const joinedIDs = userNames.join('-');
    const chatChannelUniqueName = md5(joinedIDs);
    console.log(chatChannelUniqueName);
    const chatChannel = this._channelMap.get(chatChannelUniqueName);
    if (!chatChannel) {
      throw Error('Channel channel does not exist');
    }
    chatChannel.sendMessage(message);
  }

  public async initChat(userNames: string[], isMeetingNotes: boolean): Promise<Message[]> {
    console.log('Initchat', userNames);
    let chatChannelUniqueName = '';
    let chatChannelFriendlyName = '';
    let messageItems = [];

    if (isMeetingNotes) {
      chatChannelUniqueName = this._meetingNotesChannelID;
      chatChannelFriendlyName = 'meeting-notes';
    } else {
      assert(this._username);
      userNames.push(this._username);
      console.log('Initchat2', userNames);
      userNames.sort();
      const joinedIDs = userNames.join('-');
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
      userNames.forEach(id => {
        joinedChannel.invite(id);
      });
      const messageHistory = await joinedChannel.getMessages();
      messageItems = messageHistory.items;
    }
    return messageItems;
  }
}
