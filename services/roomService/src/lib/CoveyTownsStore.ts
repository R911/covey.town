import { CoveyTownList } from '../CoveyTypes';
import Player from '../types/Player';
import CoveyTownController from './CoveyTownController';

function passwordMatches(provided: string, expected: string): boolean {
  if (provided === expected) {
    return true;
  }
  if (process.env.MASTER_TOWN_PASSWORD && process.env.MASTER_TOWN_PASWORD === provided) {
    return true;
  }
  return false;
}

export default class CoveyTownsStore {
  private static _instance: CoveyTownsStore;

  private _towns: CoveyTownController[] = [];

  static getInstance(): CoveyTownsStore {
    if (CoveyTownsStore._instance === undefined) {
      CoveyTownsStore._instance = new CoveyTownsStore();
    }
    return CoveyTownsStore._instance;
  }

  getControllerForTown(coveyTownID: string): CoveyTownController | undefined {
    return this._towns.find(town => town.coveyTownID === coveyTownID);
  }

  getTowns(): CoveyTownList {
    return this._towns
      .filter(townController => townController.isPubliclyListed)
      .map(townController => ({
        coveyTownID: townController.coveyTownID,
        friendlyName: townController.friendlyName,
        currentOccupancy: townController.occupancy,
        maximumOccupancy: townController.capacity,
      }));
  }

  createTown(
    friendlyName: string,
    isPubliclyListed: boolean,
    capacity?: number,
  ): CoveyTownController {
    const newTown = new CoveyTownController(friendlyName, isPubliclyListed, capacity);
    this._towns.push(newTown);
    return newTown;
  }

  updateTown(
    coveyTownID: string,
    coveyTownPassword: string,
    friendlyName?: string,
    makePublic?: boolean,
    capacity?: number,
  ): boolean {
    const existingTown = this.getControllerForTown(coveyTownID);
    if (existingTown && passwordMatches(coveyTownPassword, existingTown.townUpdatePassword)) {
      if (friendlyName !== undefined) {
        if (friendlyName.length === 0) {
          return false;
        }
        existingTown.friendlyName = friendlyName;
      }
      if (makePublic !== undefined) {
        existingTown.isPubliclyListed = makePublic;
      }
      if (capacity !== undefined) {
        if (capacity >= 10 && capacity <= 150) {
          existingTown.capacity = capacity;
        }
      }
      return true;
    }
    return false;
  }

  deleteTown(coveyTownID: string, coveyTownPassword: string): boolean {
    const existingTown = this.getControllerForTown(coveyTownID);
    if (existingTown && passwordMatches(coveyTownPassword, existingTown.townUpdatePassword)) {
      this._towns = this._towns.filter(town => town !== existingTown);
      existingTown.disconnectAllPlayers();
      return true;
    }
    return false;
  }

  getParticipants(coveyTownID: string): Player[] {
    const existingTown = this.getControllerForTown(coveyTownID);
    if (existingTown) {
      return existingTown.players;
    }
    throw Error('Invalid townID provided, no such town exists');
  }

  updatePlayer(
    coveyTownID: string,
    coveyTownPassword: string,
    userId: string,
    playerId: string,
    videoAccess?: boolean,
    audioAccess?: boolean,
    chatAccess?: boolean,
    isAdmin?: boolean,
  ): boolean {
    const existingTown = this.getControllerForTown(coveyTownID);
    if (existingTown && passwordMatches(coveyTownPassword, existingTown.townUpdatePassword)) {
      const user = existingTown.getPlayer(userId);
      if (!user?.privileges.admin) {
        return false;
      }
      const modifiedPlayer = existingTown.getPlayer(playerId);
      if (modifiedPlayer === undefined) {
        return false;
      }
      const userPrivilege = modifiedPlayer.privileges;
      if (videoAccess !== undefined) {
        userPrivilege.video = videoAccess;
      }
      if (audioAccess !== undefined) {
        userPrivilege.audio = audioAccess;
      }
      if (chatAccess !== undefined) {
        userPrivilege.chat = chatAccess;
      }
      if (isAdmin !== undefined) {
        userPrivilege.admin = isAdmin;
        userPrivilege.video = true;
        userPrivilege.audio = true;
        userPrivilege.chat = true;
      }
      existingTown.updatePlayerPrivileges(modifiedPlayer, userPrivilege);
      existingTown.makeAdmin(playerId);
      return true;
    }
    return false;
  }

  banPlayer(
    coveyTownID: string,
    coveyTownPassword: string,
    userId: string,
    playerId: string,
  ): boolean {
    const existingTown = this.getControllerForTown(coveyTownID);
    if (existingTown && passwordMatches(coveyTownPassword, existingTown.townUpdatePassword)) {
      const user = existingTown.getPlayer(userId);

      if (!user?.privileges.admin) {
        return false;
      }

      // if(user.password !== userPassword) return false;
      const modifiedPlayerSession = existingTown.getSessionByPlayerId(playerId);
      if (modifiedPlayerSession === undefined) {
        return false;
      }
      existingTown.banPlayer(modifiedPlayerSession);
      return true;
    }
    return false;
  }

  emptyTown(coveyTownID: string, coveyTownPassword: string, userId: string): boolean {
    const existingTown = this.getControllerForTown(coveyTownID);
    if (existingTown && passwordMatches(coveyTownPassword, existingTown.townUpdatePassword)) {
      const user = existingTown.getPlayer(userId);

      if (!user?.privileges.admin) {
        return false;
      }

      // if(user.password !== userPassword) return false;
      existingTown.disconnectAllPlayers();
      return true;
    }
    return false;
  }

  askToBecomeAdmin(coveyTownID: string, userId: string): boolean {
    const existingTown = this.getControllerForTown(coveyTownID);
    if (existingTown !== undefined) {
      const user = existingTown.getPlayer(userId);
      if (user === undefined || user.privileges.admin) {
        return false;
      }
      existingTown.askToBecomeAdmin(user);
      return true;
    }

    return false;
  }
}
