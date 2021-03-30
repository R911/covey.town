import CoveyTownController from './CoveyTownController';
import { CoveyTownList, UserPrivileges } from '../CoveyTypes';

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
    return this._towns.filter(townController => townController.isPubliclyListed)
      .map(townController => ({
        coveyTownID: townController.coveyTownID,
        friendlyName: townController.friendlyName,
        currentOccupancy: townController.occupancy,
        maximumOccupancy: townController.capacity,
      }));
  }

  createTown(friendlyName: string, isPubliclyListed: boolean): CoveyTownController {
    const newTown = new CoveyTownController(friendlyName, isPubliclyListed);
    this._towns.push(newTown);
    return newTown;
  }

  updateTown(coveyTownID: string, coveyTownPassword: string, friendlyName?: string, makePublic?: boolean): boolean {
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

  updatePlayer(coveyTownID: string, coveyTownPassword: string, userId: string, userPassword: string, playerId: string, videoAccess?: boolean, audioAccess?: boolean, chatAccess?: boolean, isAdmin?:boolean): boolean{
    const existingTown = this.getControllerForTown(coveyTownID); 
    if (existingTown && passwordMatches(coveyTownPassword, existingTown.townUpdatePassword)) {
      const user = existingTown.getPlayer(userId);
      if (!user?.privilages.admin){
        return false;
      }
      // if(user.password !== userPassword) return false;
      const modifiedPlayer = existingTown.getPlayer(playerId);
      if (modifiedPlayer===undefined){
        return false;
      }
      const userPrivilege = modifiedPlayer.privilages;
      if (videoAccess !== undefined){
        userPrivilege.video = videoAccess;
      }
      if (audioAccess !== undefined){
        userPrivilege.audio = audioAccess;
      }
      if (chatAccess !== undefined){
        userPrivilege.chat = chatAccess;
      }
      if (isAdmin !== undefined){
        userPrivilege.admin = isAdmin;
      }
      modifiedPlayer.updatePrivilages(userPrivilege);
      return true;
    }
    return false;
  }

}
