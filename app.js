const express = require('express');
const expressSession = require('express-session');
const csurf = require('csurf');

const path = require('path');
// import files
const db = require('./database/databaseConfig');
const configSession = require('./sessions/session.config');
const addCsrfToken = require('./middlewares/csrf-Token');
const checkLoginMiddleware = require('./middlewares/check-login');
//const saveConnectionMiddleware = require('./middlewares/save-connection-server-sent-event');

// import the webSocket
const initiateWebSocketServer = require('./webSockets/webSocketServer');

const PORT = 'mongodb://localhost:27017';
const databaseName = 'instagram';
// import the routes
const baseRoutes = require('./routes/base.routes');
const authRoutes = require('./routes/authentication.routes');
const postRoutes = require('./routes/post.routes');
const profileRoutes = require('./routes/profile.routes');
const searchRoutes = require('./routes/search.routes');
const notificationRoutes = require('./routes/notification.routes');
const chatRoutes = require('./routes/chat.routes');

const app = express();

// serve css and js files
app.use('/public',express.static('public'));
// serve the images static
app.use('/static/images', express.static('data/images'));
app.use('/static/posts', express.static('data/posts'))
// set the ejs engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
// parse the data
app.use(express.urlencoded({extended: false}));
// create the session
app.use(expressSession(configSession(PORT, databaseName)));
// csrft token
app.use(csurf());
app.use(addCsrfToken)
// check if the user is loggedIn
app.use(checkLoginMiddleware);

//app.use(saveConnectionMiddleware);



// use the routes
app.use(baseRoutes);
app.use(authRoutes);
app.use(postRoutes);
app.use('/user',profileRoutes);
app.use('/search', searchRoutes);
app.use(notificationRoutes);
app.use('/chat', chatRoutes);

// the http server
let server;
// start listening, if we connect to the database
db.connectToDataBase(PORT, databaseName).then(
    () => {
        // the promise was fulfilled
        server = app.listen(3000);
        console.log('Listening on port 3000');
        initiateWebSocketServer(server);

    }
).catch(
    (error) => {
        console.error(error);
        console.log('No connection to the database established')
    }
)