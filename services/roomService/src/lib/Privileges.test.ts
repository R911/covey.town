/* eslint-disable no-await-in-loop,@typescript-eslint/no-loop-func,no-restricted-syntax */
import { nanoid } from 'nanoid';
import Player from '../types/Player';
import CoveyTownController from './CoveyTownController';
import CoveyTownsStore from './CoveyTownsStore';

describe('User Privileges Tests', () => {
  let testingTownsStore: CoveyTownsStore;
  let testingTown: CoveyTownController;

  beforeEach(() => {
    testingTownsStore = new CoveyTownsStore();
    const townName = `user privileges tests ${nanoid()}`;
    testingTown = testingTownsStore.createTown(townName, true, 50);
  });

  it('First Player starts a meeting as Admin User', async () => {
    const player = new Player('test player');
    await testingTown.addPlayer(player);
    expect(player.privileges.admin).toBe(true);
  });

  it('Users joining after the first user are not Admin', async () => {
    const player = new Player('test player');
    await testingTown.addPlayer(player);
    const newPlayer = new Player('test player 2');
    await testingTown.addPlayer(newPlayer);
    expect(newPlayer.privileges.admin).toBe(false);
  });

  it('Admin disables Video for a User', async () => {
    const player = new Player('test player');
    await testingTown.addPlayer(player);
    const newPlayer = new Player('test player 2');
    await testingTown.addPlayer(newPlayer);
    expect(newPlayer.privileges.video).toBe(true);
    testingTown.updatePlayerPrivileges(newPlayer, {
      audio: true,
      chat: true,
      video: false,
      admin: false,
    });
    expect(newPlayer.privileges.video).toBe(false);
  });

  it('Admin disables Audio for a User', async () => {
    const player = new Player('test player');
    await testingTown.addPlayer(player);
    const newPlayer = new Player('test player 2');
    await testingTown.addPlayer(newPlayer);
    expect(newPlayer.privileges.audio).toBe(true);
    testingTown.updatePlayerPrivileges(newPlayer, {
      audio: false,
      chat: true,
      video: true,
      admin: false,
    });
    expect(newPlayer.privileges.audio).toBe(false);
  });

  it('Admin disables Chat for a User', async () => {
    const player = new Player('test player');
    await testingTown.addPlayer(player);
    const newPlayer = new Player('test player 2');
    await testingTown.addPlayer(newPlayer);
    expect(newPlayer.privileges.chat).toBe(true);
    testingTown.updatePlayerPrivileges(newPlayer, {
      audio: true,
      chat: false,
      video: true,
      admin: false,
    });
    expect(newPlayer.privileges.chat).toBe(false);
  });

  it('Admin bans a User, makes the user unable to join the room again', async () => {
    const player = new Player('test player');
    await testingTown.addPlayer(player);
    const newPlayer = new Player('test player 2');
    await testingTown.addPlayer(newPlayer);
    testingTownsStore.banPlayer(testingTown.coveyTownID, testingTown.townUpdatePassword, newPlayer.id, newPlayer.userName);
    expect( await testingTown.addPlayer(newPlayer)).toBe(undefined);
  });
});
