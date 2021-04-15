import dotenv from 'dotenv';
import Knex from 'knex';
import { nanoid } from 'nanoid';

dotenv.config();

describe('Login Backend Tests', () => {
  it('Successful Connection to DB', async () => {
    const db = Knex({
      client: 'pg',
      connection: {
        host: process.env.DATABASE_HOST,
        user: process.env.DATABASE_USERNAME,
        password: process.env.DATABASE_PASSWORD,
        database: process.env.DATABASE,
        ssl: { rejectUnauthorized: false },
      },
    });
    await db('accounts')
      .where('user_name', '=', 'DjoserII')
      .then(async data => {
        expect(data).not.toBe(undefined);
      });
  });
  it('User Sign Up - Add New User', async () => {
    const db = Knex({
      client: 'pg',
      connection: {
        host: process.env.DATABASE_HOST,
        user: process.env.DATABASE_USERNAME,
        password: process.env.DATABASE_PASSWORD,
        database: process.env.DATABASE,
      },
    });
    await db('accounts')
      .where('user_name', '=', 'DjoserII')
      .then(async data => {
        if (!data.length) {
          const userID = nanoid();
          await db('accounts')
            .insert([
              {
                user_id: userID,
                user_name: 'TEST_USER',
                password: 'T3$TP@$$w0rd',
              },
            ])
            .then(async dataNewUser => {
              expect(dataNewUser).not.toBe(undefined);
            })
            .catch(() => {});
        }
      })
      .catch(() => {});
  });
  it('User Sign Up - User Already Exists', async () => {
    const db = Knex({
      client: 'pg',
      connection: {
        host: process.env.DATABASE_HOST,
        user: process.env.DATABASE_USERNAME,
        password: process.env.DATABASE_PASSWORD,
        database: process.env.DATABASE,
      },
    });
    await db('accounts')
      .where('user_name', '=', 'DjoserII')
      .then(async data => {
        expect(data).not.toBe(undefined);
      });
  });
});
