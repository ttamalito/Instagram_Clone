# Instagram Clone

## This project is an instagram clone (the world famous social media app) 

This is a simple HTTP/1.1 clone of instagram, I decided to embark on this journey
to gain experience in Backend Development.
The source code is written in Node.js, using the Express.js Library.
The main focus of the project is the Backend Architecture.
This is just a backend server, I built a Front-End server using React.js, [this is the repository](https://github.com/ttamalito/instagram_clone_front-end)
There is still more to come for this project, like voice- and video-calls and many other things.
The code is well documented with JSDocs.

I spent several months with this project, at the moment it has all the "main" features from instagram,
they are detailed below

## The project has the following features.
* Creating a Profile with several details
* Updating the profile details (profile picture, Bio, etc...)
* Making the Profile Public or Private
* Real-time in-app notifications using Server-Sent-Events
* Follow and Unfollow other users. (User receives a notification)
* Sending request to follow users which have a private profile (User receives a notification)
* Making Posts (Pictures and videos)
* Liking, Disliking and Commenting Posts of other users (The user receiving the like/comment receives a notification)
* Live Chatting functionality using WebSockets
* Uploading stories, that are deleted automatically after 24 hours
* The user needs to be logged in, in order to do most of the stuff, if the user tries to do any activity that requires authentication, and the user is not logged in, the user will be redirected to the /login page, to login
* The logged in status is tracked with the use of sessions, and they are shared with the front-end in the form of cookies with the sessionId
* In terms of security all posts containing a form need a CSRF token, that is validated by the server
* Functionality to reject the follow request of a user
* Functionality to delete the notifications


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



### Server-Sent-Events
This is used to send in-app notifications to the user, there is a front-end script that on every single page
establishes a Server-Sent-Event connection with the backend, so that when the user is online the server can
send notifications to the user without the user making a request.
### WebSockets
This is used to make the chat functionality possible. Whenever the user visits
/chats then a WebSocket Connection is established, and the user can send
messages in real time to the other user if, the other party has also established a WebSocket connection (i.e. they are on the /chats page)
If the other party is not in the /chats page, then the user receives a Notification about a new message.
All the messages are stored with a unique id in the respective collection.


## User instructions to run the server locally
You need to clone the [front-end repository for this project](https://github.com/ttamalito/instagram_clone_front-end) !!
* Install Node.js, if you do not have it in your machine.
* Clone the repository into a directory of your choice
* run the following command to install the dependencies: npm install
* In order to start the HTTP server in your local machine run: npm start
* This will start the server on localhost:3000
* Please make sure that you have mongodb installed and it can be reached through the url: mongodb://localhost:27017, otherwise the server will not start

Then in your terminal you should see:
Listening on port 3000
WebSocket server up and running on Port 3000

If you see this then you can access the backend server locally.

Thank you for reading!

