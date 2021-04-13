# Covey.Town

Covey.Town provides a virtual meeting space where different groups of people can have simultaneous video calls, allowing participants to drift between different conversations, just like in real life. It has features like user authentication and login, user chats, meeting notes, and user profile management. Each user can have different roles - can either be an admin or a regular attendee of the meeting.

Covey.Town was built for **Northeastern's (Spring 2021) CS5500 Foundations of Software Engineering**, and is designed to be reused across semesters. You can view our reference deployment of the app at app.covey.town.The code base has been used as provided with new features implemented over the code base.

![Covey.Town Architecture](https://i.imgur.com/lFgT8Rc.png)

The figure above depicts the high-level architecture of Covey.Town.
The frontend client (in the `frontend` directory of this repository) uses the [PhaserJS Game Library](https://phaser.io) to create a 2D game interface, using tilemaps and sprites.
The frontend implements video chat using the [Twilio Programmable Video](https://www.twilio.com/docs/video) API, and that aspect of the interface relies heavily on [Twilio's React Starter App](https://github.com/twilio/twilio-video-app-react).

A backend service (in the `services/roomService` directory) implements the application logic: tracking which "towns" are available to be joined, and the state of each of those towns.

## Running this app locally

Running the application locally entails running both the backend service and a frontend.

### Setting up the backend

To run the backend, you will need a Twilio account. Twilio provides new accounts with $15 of credit, which is more than enough to get started.
To create an account and configure your local environment:

1. Go to [Twilio](https://www.twilio.com/) and create an account. You do not need to provide a credit card to create a trial account.
2. Create an API key and secret (select "API Keys" on the left under "Settings")
3. Create a local postgres db and add a new schema as given below.
4. Create a `.env` file in the `services/roomService` directory, setting the values as follows:

| Config Value              | Description                                    |
| ------------------------- | ---------------------------------------------- |
| `TWILIO_ACCOUNT_SID`      | Visible on your twilio account dashboard.      |
| `TWILIO_API_KEY_SID`      | The SID of the new API key you created.        |
| `TWILIO_API_KEY_SECRET`   | The secret for the API key you created.        |
| `TWILIO_API_AUTH_TOKEN`   | Visible on your twilio account dashboard.      |
| `TWILIO_CHAT_SERVICE_SID` | Visible on your twilio account chat dashboard. |
| `DATABASE_HOST`           | Host address of your database                  |
| `DATABASE`                | Name of the database                           |
| `DATABASE_USERNAME`       | Username for database access                   |
| `DATABASE_PASSWORD`       | Password for the user of the database          |

### Creating the DB schema

Use the following query to setup the accounts table in your PostgreSQL db.

```
CREATE TABLE
ACCOUNTS (
USER_ID VARCHAR ( 21 ) NOT NULL,
USER_NAME VARCHAR ( 20 ) PRIMARY KEY NOT NULL,
PASSWORD VARCHAR ( 16 ) NOT NULL);
```

### Starting the backend

Once your backend is configured, you can start it by running `npm start` in the `services/roomService` directory (the first time you run it, you will also need to run `npm install`).
The backend will automatically restart if you change any of the files in the `services/roomService/src` directory.

### Configuring the frontend

Create a `.env` file in the `frontend` directory, with the line: `REACT_APP_TOWNS_SERVICE_URL=http://localhost:8081` (if you deploy the rooms/towns service to another location, put that location here instead)

### Running the frontend

In the `frontend` directory, run `npm start` (again, you'll need to run `npm install` the very first time). After several moments (or minutes, depending on the speed of your machine), a browser will open with the frontend running locally.
The frontend will automatically re-compile and reload in your browser if you change any files in the `frontend/src` directory.
