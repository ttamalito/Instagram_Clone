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
        imagePath:`posts/${imageFileName}`,
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
 * @param {ObjectId} postId id of the post
 * @returns {Promise<Post?>}
 */
async function getPost(postId) {
    return await db.getDatabase().collection(COLLECTION).findOne({
        _id: postId
    });
}

/**
 * Likes a post with postId by user with userId, if the post was not liked before by that user
 * @param {String} userId The user liking the post
 * @param {String} postId The postId
 * @returns {Promise<boolean>} true if liked was added, false if like was removed
 */
async function likePost(postId, userId) {

    // check if the user already liked the picture
    const liked = await db.getDatabase().collection(COLLECTION).findOne({
        $and : [{_id: new ObjectId(postId)}, { likes: {$in: [new ObjectId(userId)]}}]
    })
    if (liked) {
        // the user has already liked the post
        // remove the like from the post
        const removed = await db.getDatabase().collection(COLLECTION).updateOne({
            _id: new ObjectId(postId)
        }, {
            // specify the element to remove
            $pull: {likes: new ObjectId(userId)}
        });
        return false;
    } // here ends the if for liked

    // add the like
    const result = await db.getDatabase().collection(COLLECTION).updateOne({
        _id: new ObjectId(postId)
    }, {
        // operation to perform
        $push : {likes: new ObjectId(userId)}
    });



    return result.acknowledged;
}

/**
 * Saves a comment from userId to the post with postId
 * @param {String} userId
 * @param {String} postId
 * @param {String} comment
 * @returns {Promise<boolean>}
 */
async function commentPost(userId, postId, comment) {
    const comm = {
        userId: new ObjectId(userId),
        comment: comment,
        dateCreated: new Date().toISOString(),
        likes: []
    }
    // insert the comment to the database
    const result = await db.getDatabase().collection(COLLECTION).updateOne({
        // query parameters
        _id: new ObjectId(postId)
    }, {
        // what to update
        $push: {comments: comm}
    });

    return result.acknowledged;
} // here ends commentPost


module.exports = {
    savePost: savePost,
    getPost: getPost,
    likePost: likePost,
    commentPost: commentPost
}