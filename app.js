const express = require('express');

const db = require('./database/databaseConfig');


const PORT = 'mongodb://localhost:27017';
const databaseName = 'instagram';

const app = express();

// import the routes
const baseRoutes = require('./routes/base.routes');


// use the routes
app.use(baseRoutes);

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
app.listen(3000);