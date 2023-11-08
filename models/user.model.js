// file to communicate to the user database

const db = require('../database/databaseConfig');

const COLLECTION = 'users';

/**
 * Saves a user to ´users´ collection asynchronously
 * @param email
 * @param password
 * @param username
 * @param bio
 * @returns {Promise<void>}
 */
async function saveUser(email, password, username, bio) {
    // hash the password
    const hashedPassword = await bcrypt.hash(password, 12)//
    // the data has been validated
    const saveResult = await db.getDatabase().collection('users').insertOne({
        email: email,
        password: hashedPassword,
        username: username,
        bio: bio,
        profilePicture: 'default_profile_pic', // relative path to /images/profilePictures
        followers: [],
        following: [],
        savedPosts: [],
        posts: []

    })
} // here ends the function

/**
 * Checks if there is an instance with the given email
 * @param {String} email
 * @returns {Promise<boolean>} true if the email is unique
 */
async function checkUniqueEmail(email) {
    const result = await db.getDatabase().collection('users').findOne({
        email: email
    })

    if (!result) {
        // there is no result
        return true;
    }

    // there is a result, the email is not unique
    return false;
} // here ends checkUniqueEmail

/**
 * Checks if the username is unique
 * @param username
 * @returns {Promise<boolean>} true if the username is unique
 */
async function checkUniqueUsername(username) {
    const result = await db.getDatabase().collection(COLLECTION).findOne({
        username: username
    })
    if (!result) {
        // there is no result
        return true;
    }

    // there is a result, the username is not unique
    return false;
} // here eds the function

/**
 * Retreives a user from the database
 * @param {String} username
 * @returns {Promise<User?>}
 */
async function retrieveUserByUsername(username) {
    const result = await db.getDatabase().collection(COLLECTION).findOne({
        username: username
    })

    return result;
}

/**
 * Retrieves a user with the email
 * @param email
 * @returns {Promise<*>}
 */
async function retrieveUserByEmail(email) {
    return result = await db.getDatabase().collection(COLLECTION).findOne({
        email: email
    })
}

/**
 * Asynchronously compares the password to the stored password
 * @param unhashedPassword
 * @param hashedPassword
 * @returns {Promise<*>}
 */
async function hasMatchingPassword(unhashedPassword, hashedPassword) {
    const result = await bcrypt.compare(unhashedPassword, hashedPassword);
    return result;
}


module.exports = {
    saveUser: saveUser,
    checkUniqueEmail: checkUniqueEmail,
    checkUniqueUsername: checkUniqueUsername,
    retrieveUserByEmail: retrieveUserByEmail,
    retrieveUserByUsername: retrieveUserByUsername,
    hasMatchingPassword: hasMatchingPassword
}