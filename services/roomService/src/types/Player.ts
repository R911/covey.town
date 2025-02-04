import { nanoid } from 'nanoid';
import { UserLocation, UserPrivileges } from '../CoveyTypes';

/**
 * Each user who is connected to a town is represented by a Player object
 */
export default class Player {
  /** The current location of this user in the world map * */
  public location: UserLocation;

  /** The unique identifier for this player * */
  private readonly _id: string;

  /** The player's username, which is not guaranteed to be unique within the town * */
  private readonly _userName: string;

  public privileges: UserPrivileges;

  constructor(userName: string, id?: string) {
    this.location = {
      x: 0,
      y: 0,
      moving: false,
      rotation: 'front',
    };
    this.privileges = {
      audio: true,
      video: true,
      chat: true,
      admin: false,
    };
    this._userName = userName;
    if (id === undefined) {
      this._id = nanoid();
    } else {
      this._id = id;
    }
  }

  get userName(): string {
    return this._userName;
  }

  get id(): string {
    return this._id;
  }

  updateLocation(location: UserLocation): void {
    this.location = location;
  }

  updatePrivilages(privileges: UserPrivileges): void {
    this.privileges = privileges;
  }
}
