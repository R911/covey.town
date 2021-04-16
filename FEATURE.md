# Features - Covey.Town Application

## Meeting Notes

Covey.Town has a meeting note feature that allows all players to add to the notes when they are in the town. The added notes are saved and players who enter the meeting later, will receive the record of the notes in their meeting notes window. This will allow players to catch up on what they have missed. Players are also able to download a copy of the meeting notes to their local drive.

## Chat

To implement the chat, we utlized [Twilio Chat API](https://www.twilio.com/docs/chat). Twilio Chat API is a cloud communication platform that enables players to communicate with text across channels. We decided to use Twilio Chat API as it provides a powerful API and fits in well with the Twilio Video API already being used in the project.

- ### Whole Group Chat

  - Covey.Town has a whole group chat feature that allows players to send messages to all other players in the town. Unlike the meeting notes, the whole group chat does not keep a running record of the messages. To access the whole group chat, select "Everyone" from the participants drop-down.

- ### One-to-one Chat

  - Covey.Town has a one-to-one chat feature that allows a player to send private messages to a single other player in the town. Players can select the player's username they want to send the message to from the participants drop-down. When a player is selected, the chat window loads and displays the chat history between the two players since joining the town.

- ### Small Group Chat
  - Covey.Town has a small group chat feature that allows a player to send private messages to a select group of players in the town. Multiple usernames can be selected from the participants drop-down, which forms a group. When a group of usernames is selected, the chat history in that group is loaded onto the chat window.

## User Authentication

Covey.Town allows users to login to the meeting using credentials. The authentication allows users to use a password to log in with their registered username. The credentials are stored in a PostreqSQL database. This feature allows the users to save their identity, which reduces the need to enter a username every they want to join a new room. Also only authorized users can enter a meeting room and meet with other users, who also have to be registered.

The authentication feature has been added as a new page which appears before the towns selection page. After authentication, the user can either select a town to join or may create a new town. When they join a town, they enter with their stored username.

- ### Login

  - The login feature allows users to login using a saved password before being able to start or join a meeting. The users enter their unique user id and password to login to their account. If the entered credentials match with the credentials in the database, the user is authenticated. Once the user has been authorized, they are redirected to the home page with the list of rooms that they can join or create another room. For new users, who do not exist on the database can proceed with the sign up feature.

- ### Sign Up
  - The sign up feature allows for new users to register to the Covey.Town application. Each user needs to select a new unique user id. The user also needs to select a password that is to be associated with the account. The password must contain lower case, upper case, numbers, and special characters to be counted as a allowed password. Once the player signs up, the user information is saved in the database and proceeds to the home page with the newly registered user name.

## Town Selection and Town Setting

Covey.Town now allows users to select the size of a town using a slider button, which has a range of 10-150 (with a default of 50). Once a town is created, an admin has the option to modify the room size using town settings button.

## User Types and Privileges

Covey.Town now has two types of users inside a town: Admin and Attendee. Each user has three privileges inside a town:

- Audio: Mic for interacting with other players inside town, using Twilio APIs
- Video: Video feed of user to be seen by other players inside town using Twilio APIs.
- Chat: Chat box access to interact with players inside town using Twilio Chat APIs.

Once disabled, a user's feed (video, audio and chat) cuts off and the buttons to re-enable (audio and video) them are disabled.

The user who creates a town is automatically made an admin. All the other users are attendees. A new button is added to the bottom menubar of the town for two types of users:

- ### Admin

  - An admin gets access to "Admin Control" button. This gives the admin the option to disable the privileges of all attendees inside a room using the town password. An admin can either individually disable the privilege(s) of an attendee or all attendees at once. An admin cannot disable privileges of another admin. An admin can ban an attendee from a town (forcing them to exit the town and barring them to re-enter). An admin can also clear a room (all users are thrown out including all admins), but the town is not deleted. Even if an admin leaves a room, they retain their privileges. Once an admin promotes an attendee to admin, all their privileges are returned (if disabled before). Admin can view all privileges of other admins, but they are disabled for modification.

- ### Attendee
  - An attendee gets access to "Ask to become Admin" button. This gives an attendee the option to send a notification(toast) to all admins inside the town to promote them to admin type.

## Multi-login

Covey.town allows a single user to login multiple times (different tabs) but, if a user is already inside a town, they cannot enter that town again.

## Missing Features

- Room Shareable Link
- Avatar Selection
- User Profiles
