import assert from 'assert';
import dotenv from 'dotenv';
import Twilio from 'twilio';
import IChatClient from './IChatClient';

dotenv.config();

export default class TwilioChat implements IChatClient {
  private static _instance: TwilioChat;

  private _twilioAccountSid: string;

  private _twilioApiKeySID: string;

  private _twilioApiKeySecret: string;

  private _twilioChatSID: string;

  constructor(
    twilioAccountSid: string,
    twilioChatSID: string,
    twilioAPIKeySID: string,
    twilioAPIKeySecret: string,
  ) {
    this._twilioAccountSid = twilioAccountSid;
    this._twilioApiKeySID = twilioAPIKeySID;
    this._twilioApiKeySecret = twilioAPIKeySecret;
    this._twilioChatSID = twilioChatSID;
  }

  public static getInstance(): TwilioChat {
    if (!TwilioChat._instance) {
      assert(
        process.env.TWILIO_CHAT_SERVICE_SID,
        'Environmental variable TWILIO_CHAT_SERVICE_SID must be set',
      );
      assert(
        process.env.TWILIO_ACCOUNT_SID,
        'Environmental variable TWILIO_ACCOUNT_SID must be set',
      );
      assert(
        process.env.TWILIO_API_KEY_SID,
        'Environmental variable TWILIO_API_KEY_SID must be set',
      );
      assert(
        process.env.TWILIO_API_KEY_SECRET,
        'Environmental variable TWILIO_API_KEY_SECRET must be set',
      );
      TwilioChat._instance = new TwilioChat(
        process.env.TWILIO_ACCOUNT_SID,
        process.env.TWILIO_CHAT_SERVICE_SID,
        process.env.TWILIO_API_KEY_SID,
        process.env.TWILIO_API_KEY_SECRET,
      );
    }
    return TwilioChat._instance;
  }

  async getChatToken(identity: string): Promise<string> {
    const chatGrant = new Twilio.jwt.AccessToken.ChatGrant({ serviceSid: this._twilioChatSID });
    // Create a "grant" which enables a client to use Chat as a given user
    const token = new Twilio.jwt.AccessToken(
      this._twilioAccountSid,
      this._twilioApiKeySID,
      this._twilioApiKeySecret,
      {identity},
    );

    token.addGrant(chatGrant);

    return token.toJwt();
  }
}
