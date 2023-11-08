const db = require('../database/databaseConfig');

/**
 * Saves a Post to the 'posts' collection
 * @param userId Owner of the post
 * @param imageFileName fileName saved in the server
 * @param caption Caption of the user
 * @returns {Promise<ObjectId>} this might be string, double check please
 */
async function savePost(userId, imageFileName, caption) {
    const saveResult = await db.getDatabase().collection('posts').insertOne({
        userId: userId,
        imageFileName: imageFileName,
        caption: caption,
        likes: [],
        comments: []
    })
    // Type of this is a mystery
    return saveResult.insertedId;
}

module.exports = {
    savePost: savePost
}