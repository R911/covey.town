import BodyParser from 'body-parser';
import crypto from 'crypto';
import dotenv from 'dotenv';
import { Express } from 'express';
import session from 'express-session';
import { Server } from 'http';
import { StatusCodes } from 'http-status-codes';
import Knex from 'knex';
import io from 'socket.io';
import { nanoid } from 'nanoid';
import {
  banPlayerHandler,
  emptyRoomHandler,
  playerUpdateHandler,
  townCreateHandler,
  townDeleteHandler,
  townJoinHandler,
  townListHandler,
  townPartcipantListHandler,
  townSubscriptionHandler,
  townUpdateHandler,
} from '../requestHandlers/CoveyTownRequestHandlers';
import { logError } from '../Utils';

dotenv.config();

declare module 'express-session' {
  interface Session {
    sessionToken: string;
  }
}

export default function addTownRoutes(http: Server, app: Express): io.Server {
  const db = Knex({
    client: 'pg',
    connection: {
      host: process.env.DATABASE_HOST,
      user: process.env.DATABASE_USERNAME,
      password: process.env.DATABASE_PASSWORD,
      database: process.env.DATABASE,
    },
  });

  app.use(session({ secret: '1234567890QWERT', cookie: { secure: true } }));

  /*
   * Create a new session (aka join a town)
   */
  app.post('/sessions', BodyParser.json(), async (req, res) => {
    try {
      const result = await townJoinHandler({
        userName: req.body.userName,
        coveyTownID: req.body.coveyTownID,
      });
      res.status(StatusCodes.OK).json(result);
    } catch (err) {
      logError(err);
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        message: 'Internal server error, please see log in server for more details',
      });
    }
  });

  /**
   * Delete a town
   */
  app.delete('/towns/:townID/:townPassword', BodyParser.json(), async (req, res) => {
    try {
      const result = await townDeleteHandler({
        coveyTownID: req.params.townID,
        coveyTownPassword: req.params.townPassword,
      });
      res.status(200).json(result);
    } catch (err) {
      logError(err);
      res.status(500).json({
        message: 'Internal server error, please see log in server for details',
      });
    }
  });

  /**
   * List all towns
   */
  app.get('/towns', BodyParser.json(), async (_req, res) => {
    try {
      const result = await townListHandler();
      res.status(StatusCodes.OK).json(result);
    } catch (err) {
      logError(err);
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        message: 'Internal server error, please see log in server for more details',
      });
    }
  });

  /**
   * Create a town
   */
  app.post('/towns', BodyParser.json(), async (req, res) => {
    try {
      const result = await townCreateHandler(req.body);
      res.status(StatusCodes.OK).json(result);
    } catch (err) {
      logError(err);
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        message: 'Internal server error, please see log in server for more details',
      });
    }
  });
  /**
   * Update a town
   */
  app.patch('/towns/:townID', BodyParser.json(), async (req, res) => {
    try {
      const result = await townUpdateHandler({
        coveyTownID: req.params.townID,
        isPubliclyListed: req.body.isPubliclyListed,
        friendlyName: req.body.friendlyName,
        coveyTownPassword: req.body.coveyTownPassword,
        capacity: req.body.capacity,
      });
      res.status(StatusCodes.OK).json(result);
    } catch (err) {
      logError(err);
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        message: 'Internal server error, please see log in server for more details',
      });
    }
  });

  app.get('/towns/participants/:townID', BodyParser.json(), async (req, res) => {
    try {
      const result = await townPartcipantListHandler(req.params.townID);
      res.status(StatusCodes.OK).json(result);
    } catch (err) {
      logError(err);
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        message: 'Internal server error, please see log in server for more details',
      });
    }
  });

  /**
   * Update a player
   */
  app.patch('/player/:userId', BodyParser.json(), async (req, res) => {
    try {
      // console.log(req.body);
      const result = await playerUpdateHandler({
        coveyTownID: req.body.coveyTownID,
        coveyTownPassword: req.body.coveyTownPassword,
        userId: req.params.userId,
        playerId: req.body.playerId,
        videoAccess: req.body.videoAccess,
        audioAccess: req.body.audioAccess,
        chatAccess: req.body.chatAccess,
        isAdmin: req.body.isAdmin,
      });
      res.status(StatusCodes.OK).json(result);
    } catch (err) {
      logError(err);
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        message: 'Internal server error, please see log in server for more details',
      });
    }
  });

  /**
   * Ban a player
   */
  app.patch('/player/ban/:userId', BodyParser.json(), async (req, res) => {
    try {
      // console.log(req);
      const result = await banPlayerHandler({
        coveyTownID: req.body.coveyTownID,
        coveyTownPassword: req.body.coveyTownPassword,
        userId: req.params.userId,
        playerId: req.body.playerId,
      });
      res.status(StatusCodes.OK).json(result);
    } catch (err) {
      logError(err);
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        message: 'Internal server error, please see log in server for more details',
      });
    }
  });

  /**
   * Destroy all session in a room
   */
  app.patch('/towns/destroyAllSessions/:townID', BodyParser.json(), async (req, res) => {
    try {
      const result = await emptyRoomHandler({
        coveyTownID: req.params.townID,
        coveyTownPassword: req.body.coveyTownPassword,
        userId: req.body.userId,
      });
      res.status(StatusCodes.OK).json(result);
    } catch (err) {
      logError(err);
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        message: 'Internal server error, please see log in server for more details',
      });
    }
  });

  /**
   * POST: Check if a valid user to authenticate.
   */
  app.post('/login', BodyParser.json(), async (req, res) => {
    const { userName, userPassword } = req.body;
    await db('accounts')
      .where('user_name', '=', userName)
      .then(async data => {
        const result = {
          isOK: true,
          response: {},
        };
        let resp = {};
        if (!data.length) {
          resp = {
            status: 404,
            error: 'User Not Found',
          };
        } else {
          await db('accounts')
            .where('user_name', '=', userName)
            .where('password', '=', userPassword)
            .then(dataPassword => {
              if (dataPassword.length) {
                const token = crypto.randomBytes(16).toString('base64');
                req.session.sessionToken = token;
                resp = { ...dataPassword[0], sessionToken: token };
              } else {
                resp = {
                  status: 404,
                  error: 'Incorrect Password. Please Try Again',
                };
              }
            })
            .catch(() => {});
        }
        result.response = resp;
        return res.json(result);
      })
      .catch(() => {});
  });

  /**
   * POST: Add a new user to Covey Town.
   */
  app.post('/signUp', BodyParser.json(), async (req, res) => {
    const { userName, userPassword } = req.body;
    await db('accounts')
      .where('user_name', '=', userName)
      .then(async data => {
        const result = {
          isOK: true,
          response: {},
        };
        let resp = {};
        if (data.length) {
          resp = {
            status: 404,
            error: 'User already Exists',
          };
        } else {
          const userID = nanoid();
          await db('accounts')
            .insert([
              {
                user_id: userID,
                user_name: userName,
                password: userPassword,
              },
            ])
            .then(() => {
              const token = crypto.randomBytes(16).toString('base64');
              req.session.sessionToken = token;
              resp = {
                sessionToken: token,
                userName,
              };
            })
            .catch(() => {});
        }
        result.response = resp;
        return res.json(result);
      })
      .catch(() => {});
  });

  /**
   *
   */
  app.post('/logout', BodyParser.json(), async (req, res) => {
    req.session.destroy(() => {
      res.redirect('/');
    });
  });

  const socketServer = new io.Server(http, { cors: { origin: '*' } });
  socketServer.on('connection', townSubscriptionHandler);
  return socketServer;
}
