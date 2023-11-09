const db = require('../database/databaseConfig');
const ObjectId = require('mongodb').ObjectId;

const COLLECTION = 'posts';
/**
 * Saves a Post to the 'posts' collection
 * @param userId Owner of the post
 * @param imageFileName fileName saved in the server
 * @param caption Caption of the user
 * @returns {Promise<ObjectId>} When the promise is fulfilled, it returns an ObjectId with the _id
 */
async function savePost(userId, imageFileName, caption) {
    const date = new Date().toISOString();
    const saveResult = await db.getDatabase().collection(COLLECTION).insertOne({
        userId: userId,
        imageFileName: imageFileName,
        caption: caption,
        likes: [],
        comments: [],
        dateCreated: date
    })
    // Type of this is a mystery
    return saveResult.insertedId;
}

/**
 * Retrieves a post with the given postID
 * @param {String} postId id of the post
 * @returns {Promise<Post?>}
 */
async function getPost(postId) {
    return await db.getDatabase().collection(COLLECTION).findOne({
        _id: postId
    });
}


module.exports = {
    savePost: savePost,
    getPost: getPost
}