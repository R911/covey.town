import BodyParser from 'body-parser';
import { Express } from 'express';
import { StatusCodes } from 'http-status-codes';
import TwilioChat from '../lib/TwilioChat';

export default function addChatRoutes(app: Express): void {
  app.get('/token/:username', BodyParser.json(), async (_req, _res) => {
    try {
      const twilioChat = TwilioChat.getInstance();
      const chatToken = await twilioChat.getChatToken(_req.params.username);
      _res
        .json({
          message: 'its working!',
          token: chatToken,
        })
        .status(StatusCodes.OK);
    } catch (e) {
      _res
        .json({
          message: 'Internal server error, please see log in server for details',
        })
        .status(StatusCodes.INTERNAL_SERVER_ERROR);
    }
  });
}
