## UML Diagrams

### Frontend -

- App -
  ![App.tsx UML](https://i.imgur.com/5fBgiT4.png)

- Frontend Privileges -
  ![Frontend Privileges UML](https://i.imgur.com/kidQ5Bw.png)

- Player class frontend -
  ![Player class frontend UML](https://i.imgur.com/nQvmXRt.png)

### Backend -

- TownController -
  ![TownController UML](https://i.imgur.com/IntbS58.png)

- Town Request Handler -
  ![Town Request Handle UML](https://i.imgur.com/p8xmjDI.png)

- Player class backend -
  ![Player class backend UML](https://i.imgur.com/GcYG7BF.png)

## CRC Cards

| Class Name: Chat                                                                                                       |
| ---------------------------------------------------------------------------------------------------------------------- |
| State: chat, logger, \_chatTown, \_chatClient, \_channelMap, \_roomID, \_meetingNoteChannelID                          |
| Responsibilities: Create chatClient and chatChannel, Send chat messages between users, Send meeting notes to all users |
| Collaborators: ChatFeature, MeetingNotes                                                                               |

| Class Name: ChatFeature                                                                                                                                                              |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| State: players, typedMessage, messages, participants, participantsToSendTo, userChatPrivilege, playerUserName, chat, coveyTownID                                                     |
| Responsibilities: Establish chat between players, send messages, display messages, provide list of players in town, update chat privileges for player, display alert for new message |
| Collaborators: Chat                                                                                                                                                                  |

| Class Name: MeetingNotes                                                                                                                  |
| ----------------------------------------------------------------------------------------------------------------------------------------- |
| State: players, typedNote, meetingNotes, userMeetingPrivilege, playerUserName, chatD                                                      |
| Responsibilities: Establish meeting notes for town, send meeting notes, display meeting notes, update meeting notes privileges for player |
| Collaborators: Chat                                                                                                                       |

| Class Name: CoveyTownController                                                                                                                                                                         |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| State: \_players, \_bannedPlayers, \_sessions, \_videoClient, \_chatClient, \_listeners, \_listenerMap, \_adminSet, \_coveyTownID, \_friendlyName, \_townUpdatePassword, \_isPubliclyListed, \_capacity |
| Responsibilities: Represent the a Town and its implement its operations                                                                                                                                 |
| Collaborators: CoveyTypes,CoveyTownListener,Player,PlayerSession,IChatClient,IVideoClient,TwilioChat,TwilioVideo,TwilioChat                                                                             |

| Class Name: PlayerSession                                                         |
| --------------------------------------------------------------------------------- |
| State:\_player,\_sessionToken,\_videoToken,\_chatToken                            |
| Responsibilities:Store the information required for a player's session in a town. |
| Collaborators: Player                                                             |

| Interface Name: IChatClient                                                 |
| --------------------------------------------------------------------------- |
| State:                                                                      |
| Responsibilities: A Chat client in Covey town must implement this interface |
| Collaborators                                                               |

| Class Name: TwilioChat                                                      |
| --------------------------------------------------------------------------- |
| State: \_twilioApiKeySecret, \_twilioChatSID                                |
| Responsibilities: Use the Twilio API to generate the server-side chat token |
| Collaborators: IChatClient, TwilioChat                                      |

| Class Name: HomePage                                                                                     |
| -------------------------------------------------------------------------------------------------------- |
| State: mediaError, userName                                                                              |
| Responsibilities: Enable after login screen, show options for joining a room, initiating a meeting, etc. |
| Collaborators: Login, App                                                                                |

| Class Name: Player                                                                                                                        |
| ----------------------------------------------------------------------------------------------------------------------------------------- |
| State: location, privileges, \_id, \_userName                                                                                             |
| Responsibilities: Stores all basic player information along with their location and privilege inside a room                               |
| Collaborators: CoveyTownController, CoveyTownStore, CoveyTownRequestHandler::townJoinHandler, PlayerSession, UserLocation, UserPrivileges |

| Type Name: UserPrivileges                                                         |
| --------------------------------------------------------------------------------- |
| State: audio, video, chat, admin                                                  |
| Responsibilities: Stores the privilege values of audio, video, chat and user type |
| Collaborators: CoveyTownController, TownServiceClient, Players                    |

| Interface Name: CoveyTownListener                                                                                                           |
| ------------------------------------------------------------------------------------------------------------------------------------------- |
| Functions: onPlayerJoined, onPlayerMoved, onPlayerDisconnected, onTownDestroyed, onPlayerRemoved, onPlayerUpdated, onPlayerAskToBecomeAdmin |
| Responsibilities: Interface for sneding signals for changes made by user in the town                                                        |
| Collaborators: CoveyTownController, CoveyTownRequestHandlers                                                                                |

| Class Name: AdminControl                                                                                                                       |
| ---------------------------------------------------------------------------------------------------------------------------------------------- |
| State: currentTownID, currentTownFriendlyName, myPlayerID, players, apiClient, askedToBecomeAdmin, townPassword, privilegeMap, adminRequestMap |
| Responsibilities: Display all players and controls to modify their privileges to admin users.                                                  |
| Collaborators: MenuBar, useCoveyAppState, useMaybeVideo, Player, PlayerUpdateRequest                                                           |

| Class Name: AttendeeControl                                            |
| ---------------------------------------------------------------------- |
| State: currentTownID, myPlayerID                                       |
| Responsibilities: Button to ask admins to promote an attendee to admin |
| Collaborators: MenuBar, useCoveyAppState                               |

## Changes to existing codebase

### App.tsx

- Added in Login page, chat UI, and meeting notes UI
- Changes needed to be made to display the new features with the Covey.Town map.
- Changes to Store (CoveyAppState) and Reducers, to support new functionality.
- No alternatives considered

### PlayerSession.ts

- Added in a secret chat token
- Changes needed to be made to allow storing the chat token, required for the client to access the chat feature in the town.
- No alternatives considered

### CoveyTownController.ts

- The CoveyTownController now uses the TwilioChat class as well to obtain a chat token and stores it in the PlayerSession variable.
- We had considered making a new API route, which could be used by the frontend to fetch the chat token directly, but we decided to store handle it similarly to the videoToken.
- Add Player modified to add support for banned players, first player (creator) of room is promoted to admin.
- Support for banning/kicking players from room.
- Support for modifying privileges of players.
- HashMap for userId to Listener, set of admin player ids and list of banned players added.

### CoveyTownsStore.ts

- Added functionality for update player inside room, ban player, empty room, become admin request.

### TownServiceClient.tsx

- Added new interfaces for all the requests and responses of the new functionality added.

### CoveyTownListener.ts

- Added new methods for player removed, player updated and become admin request.

### Player.tsx

- Added support for player privileges.

### TownSettings.tsx

- Added support for selecting room size.

### TownSelection.tsx

- Added support for selecting room size, removed user name input, since player is already registered.

### useLocalAudioToggle.tsx

- Fixed bug caused due to forced audio disable not unpublishing audio track.

## Addition

### HomePage.tsx

- Added home page for the page with all the towns information and the options to initiate a meeting, join a room etc. The login page redirects to the home page after successful authentication.

### AdminControl.tsx

- Added Admin control button inside the menubar to show controls to modify privileges of attendee users by admin users. Also it is only visible to Admin users.

### AttendeeControl.tsx

- Added to menubar for attendee(s) to ask admins to promote them to admin type.
