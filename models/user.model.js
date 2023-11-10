// file to communicate to the user database

const db = require('../database/databaseConfig');
const bcrypt = require('bcryptjs');
const COLLECTION = 'users';
const ObjectId = require('mongodb').ObjectId;

/**
 * Saves a user to ´users´ collection asynchronously
 * @param email
 * @param password
 * @param username
 * @param bio
 * @param fullname
 * @returns {Promise<void>}
 */
async function saveUser(email, password, username, bio, fullname) {
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
        posts: [],
        fullname: fullname

    })
    console.log(saveResult.insertedId);
    console.log(saveResult)
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

/**
 * Query a user by the userId
 * @param {ObjectId} userId
 * @returns {Promise<User?>}
 */
async function getUser(userId) {
    return await db.getDatabase().collection(COLLECTION).findOne({
        _id: userId
    })
}

/**
 * Adds a post with the postId to the user with the userId
 * @param {ObjectId} userId
 * @param {ObjectId} postId
 * @returns {Promise<boolean>} true if the post was added succesfully
 */
async function addPostToUser(userId, postId) {
    // check that the user exists
    const user = await getUser(userId);
    // check if null
    if (!user) {
        // no user
        return false;
    }

    // the user is there, so add the post
    const result = await db.getDatabase().collection(COLLECTION).updateOne({
        _id: userId
    }, {
        // what to update
        $push: {posts: postId}
    })
    console.log(`User ${userId.toString()} posted ${postId.toString()}`)
    console.log(result);
    return true;
} // here ends post to user

/**
 * Returns a list of users
 * @param {[ObjectId]} users Array of the ObjectIds of the users
 * @returns {Promise<[User]>}
 */
async function getUsers(users) {
    const foundUsers = await db.getDatabase().collection(COLLECTION).find({
        // query parameters
        _id : {$in: users}// matches a document where _id is one of the values in users
    });
    // console.log(foundUsers)
    return foundUsers.toArray();
}


module.exports = {
    saveUser: saveUser,
    checkUniqueEmail: checkUniqueEmail,
    checkUniqueUsername: checkUniqueUsername,
    retrieveUserByEmail: retrieveUserByEmail,
    retrieveUserByUsername: retrieveUserByUsername,
    hasMatchingPassword: hasMatchingPassword,
    getUser: getUser,
    addPostToUser: addPostToUser,
    getUsers: getUsers
}