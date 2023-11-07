const mongodb = require('mongodb');
const MongoClient = mongodb.MongoClient;
// database instance
let db;
/**
 * Creates a connection to a MongoDB database
 * @param port Url of the database
 * @param databaseName Name of the database to use in our server
 */
async function connectToDataBase(port, databaseName) {
    // create a client
    const client = await MongoClient.connect(port);
    // now initiate the db instance
    db = client.db(databaseName);
}

/**
 * Returns the database connection
 * @returns {MongoClient.db} Instance of the Database
 */
function getDatabase() {
    // check if there is a connection to the database
    if (!db) {
        // no connection
        console.log('No connection to the database');
        throw new Error('There is no connection to the database')
    }

    // else
    return db;
}

module.exports = {
    connectToDataBase: connectToDataBase,
    getDatabase: getDatabase
}