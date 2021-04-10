/**
 * The chat component of covey town must implement this interface,
 * which is used to authorize a client to use the chat from the frontend.
 */
export default interface IChatClient {
  getChatToken(identity: string): Promise<string>;
}
