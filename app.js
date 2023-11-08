const express = require('express');
const expressSession = require('express-session');
const csurf = require('csurf');
// import files
const db = require('./database/databaseConfig');
const configSession = require('./sessions/session.config');
const addCsrfToken = require('./middlewares/csrf-Token');
const checkLoginMiddleware = require('./middlewares/check-login');


const PORT = 'mongodb://localhost:27017';
const databaseName = 'instagram';
// import the routes
const baseRoutes = require('./routes/base.routes');
const authRoutes = require('./routes/authentication.routes');

const app = express();

// parse the data
app.use(express.urlencoded({extended: false}));
// create the session
app.use(expressSession(configSession(PORT, databaseName)));
// csrft token
app.use(csurf());
app.use(addCsrfToken)
// check if the user is loggedIn
app.use(checkLoginMiddleware);



// use the routes
app.use(baseRoutes);
app.use(authRoutes);

// start listening, if we connect to the database
db.connectToDataBase(PORT, databaseName).then(
    () => {
        // the promise was fulfilled
        app.listen(3000);
    }
).catch(
    (error) => {
        console.error(error);
        console.log('No connection to the database stablished')
    }
)