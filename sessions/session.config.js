const mongodbStore = require('connect-mongodb-session');

const expressSession = require('express-session');

/**
 *  Creates a store object
 * @param session
 * @param url
 * @param databaseName
 * @returns {*}
 */
function createSessionstore(session, url, databaseName) {
    // create a MongoDbStore
    const MongoDBStore = mongodbStore(session);
    const store = new MongoDBStore({
        // object with all the properties to store the session
        uri: url,
        databaseName: databaseName,
        collection: 'sessions'
    })

    return store;
}

/**
 * Creates a sesssion con
 * @param url
 * @param databaseName
 * @returns {{cookie: {maxAge: number}, saveUninitialized: boolean, name: string, secret: string, store: *, resave: boolean}}
 */
function createSessionConfig(url, databaseName) {
    const config = {
        name: 'React_Cookie',
        resave: false,
        saveUninitialized: false,
        secret: 'super secret',
        store: createSessionstore(expressSession, url, databaseName),
        cookie: {
            maxAge: 3600000 /* 1 hour*/
        }
    }

    return config;
}

module.exports = createSessionConfig;
