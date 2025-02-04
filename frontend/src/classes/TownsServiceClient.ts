import axios, { AxiosInstance, AxiosResponse } from 'axios';
import assert from 'assert';
import { ServerPlayer } from './Player';

/**
 * The format of a request to join a Town in Covey.Town, as dispatched by the server middleware
 */
export interface TownJoinRequest {
  /** userName of the player that would like to join * */
  userName: string;

  userId: string;
  /** ID of the town that the player would like to join * */
  coveyTownID: string;
}

/**
 * The format of a response to join a Town in Covey.Town, as returned by the handler to the server
 * middleware
 */
export interface TownJoinResponse {
  /** Unique ID that represents this player * */
  coveyUserID: string;
  /** Secret token that this player should use to authenticate
   * in future requests to this service * */
  coveySessionToken: string;
  /** Secret token that this player should use to authenticate
   * in future requests to the video service * */
  providerVideoToken: string;

  providerChatToken: string;
  
  /** List of players currently in this town * */
  currentPlayers: ServerPlayer[];
  /** Friendly name of this town * */
  friendlyName: string;
  /** Is this a private town? * */
  isPubliclyListed: boolean;

  capacity: number;
}

export interface TownParticipantsRequest {
  /** ID of the town to get participants for  * */
  coveyTownID: string;
}

export interface TownParticipantsResponse {
  /** List of players currently in this town * */
  participants: ServerPlayer[];
}

/**
 * Payload sent by client to create a Town in Covey.Town
 */
export interface TownCreateRequest {
  friendlyName: string;
  isPubliclyListed: boolean;
  capacity?: number;
}

/**
 * Response from the server for a Town create request
 */
export interface TownCreateResponse {
  coveyTownID: string;
  coveyTownPassword: string;
}

/**
 * Response from the server for a Town list request
 */
export interface TownListResponse {
  towns: CoveyTownInfo[];
}

/**
 * Payload sent by the client to delete a Town
 */
export interface TownDeleteRequest {
  coveyTownID: string;
  coveyTownPassword: string;
}

/**
 * Payload sent by the client to update a Town.
 * N.B., JavaScript is terrible, so:
 * if(!isPubliclyListed) -> evaluates to true if the value is false OR undefined, use ===
 */
export interface TownUpdateRequest {
  coveyTownID: string;
  coveyTownPassword: string;
  friendlyName?: string;
  isPubliclyListed?: boolean;
  capacity?:number;
}

export interface PlayerUpdateRequest {
  coveyTownID: string;
  coveyTownPassword: string;
  userId: string;
  playerId: string;
  videoAccess?: boolean;
  audioAccess?: boolean;
  chatAccess?: boolean;
  isAdmin?: boolean;
}

export interface BanPlayerRequest {
  coveyTownID: string;
  coveyTownPassword: string;
  userId: string;
  playerId: string;
}

export interface EmptyTownRequest {
  coveyTownID: string;
  coveyTownPassword: string;
  userId: string;
}

/**
 * 
 */
export interface TownAuthorizationRequest {
  userName: string;
  userPassword: string;
}

/**
 * 
 */
export interface TownAuthorizationResponse {
    status: integer,
    error: string,
    sessionToken: string,
    authToken: string,
    userName: string,
    userID: string,
}

export interface AskToBecomeAdminRequest {
  coveyTownID: string;
  userId: string;
}

/**
 * Envelope that wraps any response from the server
 */
export interface ResponseEnvelope<T> {
  isOK: boolean;
  message?: string;
  response?: T;
}

export type CoveyTownInfo = {
  friendlyName: string;
  coveyTownID: string;
  currentOccupancy: number;
  maximumOccupancy: number
};

export default class TownsServiceClient {
  private _axios: AxiosInstance;

  /**
   * Construct a new Towns Service API client. Specify a serviceURL for testing, or otherwise
   * defaults to the URL at the environmental variable REACT_APP_ROOMS_SERVICE_URL
   * @param serviceURL
   */
  constructor(serviceURL?: string) {
    const baseURL = serviceURL || process.env.REACT_APP_TOWNS_SERVICE_URL;
    assert(baseURL);
    this._axios = axios.create({ baseURL });
  }

  static unwrapOrThrowError<T>(response: AxiosResponse<ResponseEnvelope<T>>, ignoreResponse = false): T {
    if (response.data.isOK) {
      if (ignoreResponse) {
        return {} as T;
      }
      assert(response.data.response);
      return response.data.response;
    }
    throw new Error(`Error processing request: ${response.data.message}`);
  }

  async createTown(requestData: TownCreateRequest): Promise<TownCreateResponse> {
    const responseWrapper = await this._axios.post<ResponseEnvelope<TownCreateResponse>>('/towns', requestData);
    return TownsServiceClient.unwrapOrThrowError(responseWrapper);
  }

  async updateTown(requestData: TownUpdateRequest): Promise<void> {
    const responseWrapper = await this._axios.patch<ResponseEnvelope<void>>(`/towns/${requestData.coveyTownID}`, requestData);
    return TownsServiceClient.unwrapOrThrowError(responseWrapper, true);
  }

  async deleteTown(requestData: TownDeleteRequest): Promise<void> {
    const responseWrapper = await this._axios.delete<ResponseEnvelope<void>>(`/towns/${requestData.coveyTownID}/${requestData.coveyTownPassword}`);
    return TownsServiceClient.unwrapOrThrowError(responseWrapper, true);
  }

  async listTowns(): Promise<TownListResponse> {
    const responseWrapper = await this._axios.get<ResponseEnvelope<TownListResponse>>('/towns');
    return TownsServiceClient.unwrapOrThrowError(responseWrapper);
  }

  async joinTown(requestData: TownJoinRequest): Promise<TownJoinResponse> {
    const responseWrapper = await this._axios.post('/sessions', requestData);
    return TownsServiceClient.unwrapOrThrowError(responseWrapper);
  }

  async login(requestData: TownAuthorizationRequest): Promise<TownAuthorizationResponse> {
    const responseWrapper = await this._axios.post('/login', requestData);
    return TownsServiceClient.unwrapOrThrowError(responseWrapper);
  }

  async signUp(requestData: TownAuthorizationRequest): Promise<TownAuthorizationResponse> {
    const responseWrapper = await this._axios.post('/signUp', requestData);
    return TownsServiceClient.unwrapOrThrowError(responseWrapper);
  }
  
  async getParticipants(requestData: TownParticipantsRequest): Promise<TownParticipantsResponse> {
    const responseWrapper = await this._axios.get(`/towns/participants/${requestData.coveyTownID}`);
    return TownsServiceClient.unwrapOrThrowError(responseWrapper);
  }

  async modifyPlayer(requestData: PlayerUpdateRequest): Promise<void> {
    const responseWrapper = await this._axios.patch<ResponseEnvelope<void>>(`/player/${requestData.userId}`, requestData);
    return TownsServiceClient.unwrapOrThrowError(responseWrapper);
  }

  async banPlayer(requestData: BanPlayerRequest): Promise<void> {
    const responseWrapper = await this._axios.patch<ResponseEnvelope<void>>(`/player/ban/${requestData.userId}`, requestData);
    return TownsServiceClient.unwrapOrThrowError(responseWrapper);
  }

  async emptyTown(requestData: EmptyTownRequest): Promise<void> {
    const responseWrapper = await this._axios.patch<ResponseEnvelope<void>>(`/towns/destroyAllSessions/${requestData.coveyTownID}`, requestData);
    return TownsServiceClient.unwrapOrThrowError(responseWrapper);
  }

  async askToBecomeAdmin(requestData: AskToBecomeAdminRequest): Promise<void> {
    const responseWrapper = await this._axios.get<ResponseEnvelope<void>>(
      `/towns/${requestData.coveyTownID}/makeAdmin/${requestData.userId}`,
    );
    return TownsServiceClient.unwrapOrThrowError(responseWrapper);
  }

}
