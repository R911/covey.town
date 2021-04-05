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

  private _handleMessageAdded: (message: Message) => void = () => {
    throw Error('MessageAdded handler not set. Set this function using handleMessageAdded method');
  };

  private constructor(userID: string, userName: string, roomID: string, chatToken: string) {
    this._userID = userID;
    this._username = userName;
    this._roomID = roomID;
    this._chatToken = chatToken;
    this._meetingNotesChannelID = md5(`meeting-notes-${this._roomID}`);
  }

  public set handleMessageAdded(callback: (message: Message) => void) {
    this._handleMessageAdded = callback;
  }

  private async setup(): Promise<ChatClient> {
    assert(this._chatToken);
    const client = await ChatClient.create(this._chatToken);
    assert(client);
    this._chatClient = client;
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
      console.log('Chat instance created');
    }

    try {
      const chatClient = await Chat.chat.setup();
      if (!chatClient) {
        Chat.chat = null;
      } else {
        Chat.chat.initMeetingNotesChannel();
      }
    } catch (err) {
      Chat.chat = null;
      throw err;
    }
  }

  public static instance(): Chat | null {
    return Chat.chat;
  }

  private async initMeetingNotesChannel(): Promise<void> {
    let meetingNotesChannel;
    try {
      meetingNotesChannel = await this._chatClient?.getChannelByUniqueName(
        this._meetingNotesChannelID,
      );
    } catch (error) {
      this.logger.error(error);
    } finally {
      if (!meetingNotesChannel) {
        meetingNotesChannel = await this._chatClient?.createChannel({
          friendlyName: 'meeting-notes',
          uniqueName: this._meetingNotesChannelID,
        });
      }
      assert(meetingNotesChannel);
      this.joinChannel(meetingNotesChannel);
    }
  }

  private async joinChannel(newChannel: Channel) {
    if (newChannel.status !== 'joined') {
      await newChannel.join();
    }
    newChannel.on('messageAdded', this._handleMessageAdded);
    this._channelMap.set(newChannel.uniqueName, newChannel);
  }

  public sendMeetingNote(message: string): void {
    const meetingNotesChannel = this._channelMap.get(this._meetingNotesChannelID);
    if (!meetingNotesChannel) {
      throw Error('Meeting notes channel does not exist');
    }
    meetingNotesChannel.sendMessage(message);
  }
}
