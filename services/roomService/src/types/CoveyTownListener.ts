import Player from './Player';

/**
 * A listener for player-related events in each town
 */
export default interface CoveyTownListener {
  /**
   * Called when a player joins a town
   * @param newPlayer the new player
   */
  onPlayerJoined(newPlayer: Player): void;

  /**
   * Called when a player's location changes
   * @param movedPlayer the player that moved
   */
  onPlayerMoved(movedPlayer: Player): void;

  /**
   * Called when a player disconnects from the town
   * @param removedPlayer the player that disconnected
   */
  onPlayerDisconnected(removedPlayer: Player): void;

  /**
   * Called when a town is destroyed, causing all players to disconnect
   */
  onTownDestroyed(): void;

  /**
   * Called when a user is forcefully banned/removed from a town by an admin.
   */
  onPlayerRemoved(): void;

  /**
   * Called when the privileges of a player are updated
   * @param updatedPlayer the player who's privileges are updated
   */
  onPlayerUpdated(updatedPlayer: Player): void;

  /**
   * Called when an attendee asks to become an admin inside a town
   * @param player the player who asked to be admin
   */
  onPlayerAskToBecomeAdmin(player: Player): void;
}
