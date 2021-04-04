import ChatClient from 'twilio-chat';
import { Channel } from 'twilio-chat/lib/channel';
import { Message as TwilioMessage } from 'twilio/lib/twiml/MessagingResponse';
import assert from 'assert';
import md5 from 'md5';
import DebugLogger from '../DebugLogger';

export default class Chat {
  private static chat: Chat | null = null;

  private logger: DebugLogger = new DebugLogger('Chat');

  private _chatToken: string | null = null;

  private _chatClient: ChatClient | null = null;

  private _channelList: Channel[] | null = null;

  private _userID: string | null = null;

  private _username: string | null = null;

  private _roomID: string | null = null;

  private _handleMessageAdded: (message: TwilioMessage) => void;

  private constructor(userID: string, userName: string, roomID: string, chatToken: string) {
    this._userID = userID;
    this._username = userName;
    this._roomID = roomID;
    this._chatToken = chatToken;
    this._handleMessageAdded = () => {
      throw Error(
        'MessageAdded handler not set. Set this function using handleMessageAdded method',
      );
    };
  }

  public set handleMessageAdded(callback: (message: TwilioMessage) => void) {
    this._handleMessageAdded = callback;
  }

  private async setup(): Promise<ChatClient> {
    assert(this._chatToken);
    const client = await ChatClient.create(this._chatToken);
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
    }

    try {
      const chatClient = await Chat.chat.setup();
      if (!chatClient) {
        Chat.chat = null;
      }
    } catch (err) {
      Chat.chat = null;
      throw err;
    }
  }

  public static instance(): Chat | null {
    return Chat.chat;
  }

  public async joinMeetingNotesChannel(): Promise<void> {
    const meetingNotesChannelID = md5(`meeting-notes${this._roomID}`);
    let meetingNotesChannel;
    try {
      meetingNotesChannel = await this._chatClient?.getChannelByUniqueName(meetingNotesChannelID);
    } catch (error) {
      meetingNotesChannel = await this._chatClient?.createChannel({
        friendlyName: 'meeting-notes',
        uniqueName: meetingNotesChannelID,
      });
    } finally {
      assert(meetingNotesChannel);
      this.joinChannel(meetingNotesChannel);
    }
  }

  private async joinChannel(newChannel: Channel) {
    if (newChannel.status !== 'joined') {
      await newChannel.join();
    }
    newChannel.on('messageAdded', this._handleMessageAdded);
    this._channelList?.push(newChannel);
  }
}
