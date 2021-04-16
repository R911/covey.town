import ChatClient from 'twilio-chat';
import { Channel } from 'twilio-chat/lib/channel';
import assert from 'assert';
import md5 from 'md5';
import { Message } from 'twilio-chat/lib/message';
import DebugLogger from '../DebugLogger';
import { ChatConfig } from '../../CoveyTypes';

export default class Chat {
  /** Stores the  static instance of Chat */
  private static chat: Chat;

  private logger: DebugLogger = new DebugLogger('Chat');

  /** Chat token obtained from the player session */
  private _chatToken: string | null = null;

  /** Twilio chat client, used to access the chat API */
  private _chatClient: ChatClient | null = null;

  /** Stores the mapping of each channel unique name to the channel object */
  private _channelMap: Map<string, Channel> = new Map();

  /** userID of the user in the current session */
  private _userID: string | null = null;

  /** username of the user in the current session */
  private _username: string | null = null;

  /** roomID of the current covey town */
  private _roomID: string | null = null;

  /** channel unique name for the meeting notes channel */
  private _meetingNotesChannelID: string;

  /** channel unique name for the everyone chat channel */
  private _everyoneChatChannelID: string;

  /** Callback used when a meeting note is added */
  private _handleMeetingNoteAdded: (message: Message) => void = () => {
    throw Error(
      'Meeting Note Added handler not set. Set this function using handleMessageAdded method',
    );
  };

  /** Callback used when a chat message is added */
  private _handleChatMessageAdded: (message: Message) => void = () => {
    throw Error('Message Added handler not set. Set this function using handleMessageAdded method');
  };

  /** Callback used when a chat message is added in the everyone chat is added */
  private _handleEveryoneChatMessageAdded: (message: Message) => void = () => {
    throw Error('Message Added handler not set. Set this function using handleMessageAdded method');
  };

  private constructor(userID: string, userName: string, roomID: string, chatToken: string) {
    this._userID = userID;
    this._username = userName;
    this._roomID = roomID;
    this._chatToken = chatToken;
    this._meetingNotesChannelID = md5(`meeting-notes-${this._roomID}`);
    this._everyoneChatChannelID = md5(`${this._roomID}`);
  }

  public set handleMeetingNoteAdded(callback: (message: Message) => void) {
    this._handleMeetingNoteAdded = callback;
  }

  public set handleChatMessageAdded(callback: (message: Message) => void) {
    this._handleChatMessageAdded = callback;
  }

  public set handleEveryoneChatMessageAdded(callback: (message: Message) => void) {
    this._handleEveryoneChatMessageAdded = callback;
  }

  /** makes a new chat client from the chatToken */
  private async setup(): Promise<ChatClient> {
    assert(this._chatToken);
    const client = await ChatClient.create(this._chatToken);
    assert(client);
    this._chatClient = client;
    this._chatClient.on('channelInvited', (channel: Channel) => {
      this.joinChannel(channel, { isMeetingNotes: false, isEveryoneChat: false, friendlyName: '' });
    });
    return client;
  }

  /** Setups the static instance of Chat */
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
      await Chat.chat.setup();
    } catch (err) {
      Chat.chat.logger.error(err);
    }
  }

  /** returns the static instance of chat */
  public static instance(): Chat {
    return Chat.chat;
  }

  /** Joins a channel, sets the callback for messageAdded and adds it to the channelMap */
  private async joinChannel(newChannel: Channel, chatConfig: ChatConfig): Promise<Channel> {
    if (newChannel.status !== 'joined') {
      await newChannel.join();
    }
    if (chatConfig.isMeetingNotes) {
      newChannel.on('messageAdded', this._handleMeetingNoteAdded);
    } else if (chatConfig.isEveryoneChat) {
      newChannel.on('messageAdded', this._handleEveryoneChatMessageAdded);
    } else {
      newChannel.on('messageAdded', this._handleChatMessageAdded);
    }
    this._channelMap.set(newChannel.uniqueName, newChannel);
    return newChannel;
  }

  /** Send the message string passed as a message to meeting notes channel */
  public sendMeetingNote(message: string): void {
    const meetingNotesChannel = this._channelMap.get(this._meetingNotesChannelID);
    if (!meetingNotesChannel) {
      throw Error('Meeting notes channel does not exist');
    }
    meetingNotesChannel.sendMessage(message);
  }

  /** Send the message string passed as a message to channel consisting of users whose usernames
   * are passed as the list */
  public sendChatMessage(userNames: string[], message: string): void {
    userNames.sort();
    const joinedIDs = userNames.join('-');
    const chatChannelUniqueName = md5(joinedIDs);
    const chatChannel = this._channelMap.get(chatChannelUniqueName);
    if (!chatChannel) {
      throw Error('Channel channel does not exist');
    }
    chatChannel.sendMessage(message);
  }

  /** Send the message string passed as a message to everyone chat channel */
  public sendEveryoneChat(message: string): void {
    const everyoneChatChannel = this._channelMap.get(this._everyoneChatChannelID);
    if (!everyoneChatChannel) {
      throw Error('Meeting notes channel does not exist');
    }
    everyoneChatChannel.sendMessage(message);
  }

  /** initialised a chat by computing the the unique name based on the
   * list of usernames passed and also the chatConfig.
   * a new channel is created if it does not exists and its joined.
   * All users in the passed list are also invited
   * and the chat history in the channel is returned, if it exists previously */
  public async initChat(userNames: string[], chatConfig: ChatConfig): Promise<Message[]> {
    let chatChannelUniqueName = '';
    let chatChannelFriendlyName = chatConfig.friendlyName;
    let messageItems = [];

    if (chatConfig.isMeetingNotes) {
      chatChannelUniqueName = this._meetingNotesChannelID;
    } else if (chatConfig.isEveryoneChat) {
      chatChannelUniqueName = this._everyoneChatChannelID;
    } else {
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

      const joinedChannel = await this.joinChannel(chatChannel, chatConfig);
      userNames.forEach(id => {
        joinedChannel.invite(id);
      });
      const messageHistory = await joinedChannel.getMessages();
      messageItems = messageHistory.items;
    }
    return messageItems;
  }
}
