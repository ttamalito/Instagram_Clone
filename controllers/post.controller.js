const checkLoggedIn = require('../utils/checkLoggedIn');
const userModel = require('../models/user.model');
const postModel = require('../models/post.model');
const ObjectId = require('mongodb').ObjectId;
const profileUtils = require('../utils/profile.utils');
const userConnections = require('../utils/userConnections');
const {Notification, typesOfNotificationEnum} = require('../utils/Notification');
const commentModel = require('../models/comment.model');
const {isFollowed} = require('../utils/profile.utils');

// import the global variables
const global = require('../utils/global');
/**
 * GET for /createPost, it sends the CSRF token to the client
 * @param req
 * @param res
 * @param next
 */
function getCreatePost(req, res, next) {
    // check that you are loggedIn is done before

    // the user is logged in
    // send the csrf token
    res.json({
        csrf: req.csrfToken(),
        result: true
    });
} // here ends the function

/**
 * Saves a post and it adds the postId to user.posts
 * @param {Express.Request} req
 * @param res
 * @param next
 * @returns {Promise<void>}
 */
async function postCreatePost(req, res, next) {
    // check that the user is logged in is done before by the corresponding middleware
    // get the data
    const userId = req.session.userId; // user is loggedIn so there is a userId for sure
    const caption = req.body.caption;
    // access the file (image/video) in req.file
    const fileName = req.file.filename;
    const mimetype = req.file.mimetype;
    console.log(mimetype);
    const splittedString = mimetype.split("");
    let image = '';
    for (let i = 0; i < 5; i++) {
        image += splittedString[i];
    }


    let postId;
    // check if it is an image
    if (image === 'image') {
        try {
            postId = await postModel.savePost(userId, fileName, caption, 'image');
        } catch (error) {
            next(error)
            return;
        }
    } else {
        // the file was a video
        postId = await postModel.savePost(userId, fileName, caption, 'video')
        console.log('You uploaded a video');
    }


    // save the postId to the user's profile
    const userIdAsObjectId = new ObjectId(userId);
    const saveResult = await userModel.addPostToUser(userIdAsObjectId, postId);

    // check if it was successful
    if (!saveResult) {
        // post could be saved
        const error = new Error(`Post ${postId.toString()} could not be saved to user: ${userId}`);
        next(error);
        return;
    }




    // hence all good,send the appropiate response
    res.json({result: true});

} // here ends createPost

/**
 * Controller to like or dislike a post
 * If the post is already liked, it will dislike it
 * @param {Express.Request} req
 * @param {Express.Response} res
 * @param next
 * @returns {Promise<void>}
 */
async function getLike(req, res, next) {
    // validate that the user is logged in
    const loggedIn = checkLoggedIn.checkLoggedIn(req);
    if (!loggedIn) {
        // the user is not logged in
        // redirect to login
        res.redirect({
            result: false,
            url: `${global.frontend}/login`
        });
        return;
    }
    // the user is logged in
    // get the post id
    const postId = req.params.postId;
    // add a like to the post
    const likeResult = await postModel.likePost(postId, req.session.userId);
    // get the new like count
    const post = await postModel.getPost(new ObjectId(postId));
    const likeCount = post.likes.length;

    // send a notification to the owner of the post
    try {
        const ownerOfThePost = await userModel.getUser(post.userId)
        if (!ownerOfThePost) {
            console.log(`line 117 post.controller user is non existent!`);
        }
        // all good, send a notification if the ownerOfThePost has a server-sent-connection
        if (userConnections.userHasServerSentEventConnection(ownerOfThePost._id.toString())) {
            // he has a connection
            // check if the the like was added or removed
            if (likeResult) {
                // the post was liked
                // notification object to send a notification
                const notification = new Notification(
                    typesOfNotificationEnum.LIKE,
                    req.session.username,
                    ownerOfThePost.username);
                // send the like notification
                notification.sendLikeNotification(ownerOfThePost._id.toString(), post);
            } // here ends the if to see if the notification should be sent
        } // the user has a connection
    } catch (err) {
        console.error(`line 136 post.controller ${err}`);
    } // end of catch-try block
    let likeValue = 'Like';
    if (likeResult)
        likeValue = 'Dislike'
    // else all good.
    // return the new likeCount
    res.json({
        likeCount: likeCount,
        result: true,
        likeValue: likeValue
    });

} // here ends getLike

/**
 * /post/liked/:postId
 * Controller to send all the users that have liked a picture
 * @param req
 * @param res
 * @param next
 * @returns {Promise<void>}
 */
async function getLikedBy(req, res, next) {

    // get the post
    const post = await postModel.getPost(new ObjectId(req.params.postId));
    // get the owner of the post
    const ownerOfThePostId = post.userId; // this is a String
    // get the owner of the post and see if the profile is private
    const ownerOfThePost = await userModel.getUser(ownerOfThePostId);
    // make sure it exists
    if (!ownerOfThePost) {
        // there is a post with a user that doesn't exist
        next(new Error(`Post ${req.params.postId} has a non-existent owner line 140 post.controller`));
        return;
    }

    // see if the profile is private
    if (!ownerOfThePost.public) {
        // the profile is private
        // checked if login
        if (!checkLoggedIn.checkLoggedIn(req)) {
            // user not loggged in
            res.redirect('/login');
            return;
        }

        // check if the requestor is following the ownerOfThePost
        if (!profileUtils.isFollowed(ownerOfThePost.followers, req.session.userId) && req.session.userId !== ownerOfThePost._id.toString()) {
            // not following
            // thus not able to see the likes
            res.redirect(`/user/${ownerOfThePost.username}`);
            return;
        }
        // at this point all good so we can query the likes and display them
    } // here ends the if statement
    const usersIds = post.likes;

    // console.log(typeof usersIds)
    // get the array of users
    let users = await userModel.getUsers(usersIds);

    // send the data
    res.send(users);

}

/**
 * POST /post/comment/:postId, controller to post a comment
 * @param req
 * @param res
 * @param next
 * @returns {Promise<void>}
 */
async function postComment(req, res, next) {
    // check that the user is logged in
    if (!checkLoggedIn.checkLoggedIn(req)) {
        // not logged in
        res.redirect('/login');
        return;
    }

    // get the user id and the postId
    const userId = req.session.userId;
    const postId = req.params.postId;
    const comment = req.body.comment;

    // now save the comment to the database
    const result = await postModel.commentPost(userId, postId, comment);

    if (!result.result) {
        // something went wrong when saving the post
        next(new Error('Could comment Post in post.controller.postComment'));
        return;
    }

    // get the new comment count
    const post = await postModel.getPost(new ObjectId(postId));
    const commentCount = post.comments.length;

    // get the newly added comment
    const commentObject = await postModel.getComment(post._id, result.commentId);
    if (!commentObject) {
        // there is no such comment
        next(new Error(`Newly added comment cannot be found--line 235 post.controller`));
        return;
    }

    // user that posted the comment
    const sender = await userModel.getUser(new ObjectId(userId));

    // user that owns the post that received a comment
    const receiver = await userModel.getUser(post.userId);

    // send the notification
    const commentNotification = new Notification(typesOfNotificationEnum.COMMENT,
        sender.username, receiver.username);

    // check that the reciever has a connection
    if (commentNotification.userHasConnection(receiver._id.toString())) {
        const commentResult = commentNotification.sendCommentNotification(receiver._id.toString(),
            commentObject, post);
    }
    // else all good
    res.json({commentCount: commentCount});
} // here ends postComment

/**
 * Controller to send all the comments of a given post
 * @param req
 * @param res
 * @param next
 */
async function getComment(req, res, next) {
    // checked logged in
    if (!checkLoggedIn.checkLoggedIn(req)) {
        // not logged in
        res.redirect('/login');
        return;
    }
    // query all the comments for a post
    const postId = req.params.postId;
    const post = await postModel.getPost(new ObjectId(postId));
    // console.log(comments)
    const comments = await Promise.all(post.comments.map(async comment => {
        // get the comment
        const commentObject = await postModel.getComment(post._id, comment)
        const user = await userModel.getUser(commentObject.userId);
        // define a new object
        return {
            comment: commentObject.comment,
            user: user.username
        };
    }))
    res.send(comments);
    // res.json(comments);
    // else render the page
    // res.render('posts/comment', {post: {_id : req.params.postId}});
} // here ends getComment

/**
 * Controller to delete a comment from the database
 * it has 2 parameters in the URL commentId, postId
 * @param req
 * @param res
 * @param next
 * @returns {Promise<void>}
 */
async function postDeleteComment(req, res, next) {
    // check login
    if (!checkLoggedIn.checkLoggedIn(req)) {
        // not logged in
        res.redirect('/login');
        return;
    }

    // get the comment from the data base
    const commentId = new ObjectId(req.params.commentId);
    const comment = await commentModel.getComment(commentId);
    // check that the comment exists
    if (!comment) {
        // comment is null
        next(new Error(`line 286- post.controller--- no comment exists`));
        return;
    }

    // the comment exists
    // check that the owner of the comment is the one requesting to delete it
    if (req.session.userId !== comment.owner.toString()) {
        // not the same one
        console.log(`User is trying to delete a comment that he didnt post-- line 294 post.controller`);
        res.redirect('/');
        return;
    }

    // check that the comment is part of the post
    const postId = new ObjectId(req.params.postId);
    // retrieve the post
    const post = await postModel.getPost(postId);
    if (!post) {
        // there is no such post with that id
        next(new Error(`Trying to delete comment of non-existent post-- line 305 post.controller`));
        return;
    }
    // check if the commentId is part of the comments of the post
    const partOfPost = isFollowed(post.comments, commentId.toString());
    if (!partOfPost) {
        // comment is not part of the post
        next(new Error(`Comment is not part of post--line 313 post.controller`));
        return;
    }

    // else all good
    // delete the comment from the database
    const deletedComment = await commentModel.deleteComment(commentId);

    if (!deletedComment) {
        next(new Error(`Comment could not be deleted- line 322 post.controller`));
        return;
    }

    // remove the comment from the post
    const removedComment = await postModel.deleteComment(postId, commentId);
    if (!removedComment) {
        // comment could not be removed from the post
        next(new Error(`comment could not be removed from the post-- line 331 post.controller`));
        return;
    }

    // else all good
    res.json({result: true});

} // here ends postDeleteComment


module.exports = {
    getCreatePost: getCreatePost,
    postCreatePost: postCreatePost,
    getLike: getLike,
    getLikedBy: getLikedBy,
    postComment: postComment,
    getComment: getComment,
    postDeleteComment: postDeleteComment
}