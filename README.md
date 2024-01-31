# Instagram Clone

## This project is an underdeveloped instagram clone (the world famous social media app) 

This is a simple HTTP/1.1 clone of instagram, I decided to embark on this journey
to gain experience in Backend Development.
The source code is written in Node js, using the Express JS Library.
The main focus of the project is the Backend Architecture.
There is little to no style on the front-end, because I want to focus first on the Backend principles 
that I have acquired in these months.
There is still more to come for this project, like voice- and video-calls and many other things.
The code is well documented with JSDocs, so that you can take a look at it let me know if you would do 
anything different, as I just started learning Backend development, I would love to learn more things from more
experienced people.


## As of February 2024, the project has the following features.
* Creating a Profile
* Updating the profile details (profile picture, Bio, etc...)
* Making the Profile Public or Private
* Follow and Unfollow other users.
* Making Posts (Pictures and videos)
* Liking and Commenting Posts of other users
* Receive in-app notifications when the user receives a like, comment, a follow request or a new message. This is done using Server-Sent Events
* Chat functionality to message other users in real time, using WebSockets
* Uploading stories, that are deleted automatically after some time (just like real instagram)

## Technical details
 ### Storage

The project uses MongoDB as a database, there are different collections
for the different data that is needed to store.
These are:
- users

- posts

- comments
- chats
- messages
- sessions

Profile pictures and posts are stored in the directory with the help of the node js library multer
To keep track of the logged in users I use sessions that last for an hour.
This is done with the help of the express-session library in node js


### Server-Sent-Events
This is used to send in-app notifications to the user, there is a front-end script that on every single page
establishes a Server-Sent-Event connection with the backend, so that when the user is online the server can
send notifications to the user without the user making a request.
### WebSockets
This is used to make the chat functionallity possible. Whenever the user visits
/chats then a WebSocket Connection is established, and the user can send
messages in real time to the other user if, the other party has alos established a WebSocket connection (i.e. they are on the /chats page)
If the other party is not in the /chats page, then the user receives a Notification about a new message.
All the messages are stored with a unique id in the respective collection.


## User instructions to run the server locally
* Install Node js, if you do not have it in your machine.
* Clone the repository into a directory of your choice
* run the following command to install the dependencies: npm install
* In order to start the HTTP server in your local machine run: npm start
* This will start the server on localhost:3000
* Please make sure that you have mongodb installed and it can be reached through the url: mongodb://localhost:27017, otherwise the server will not start


