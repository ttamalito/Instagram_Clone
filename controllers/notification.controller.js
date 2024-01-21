const userModel = require('../models/user.model');
const {checkLoggedIn} = require("../utils/checkLoggedIn");
const {ObjectId} = require("mongodb");

/**
 * Controller to fetch the amount of notifications that a user has
 * @param {Express.Request} req
 * @param {Express.Response} res
 * @param next
 * @returns {Promise<void>}
 */
async function getFetchNotifications(req, res, next) {
    let notifications = 0;
    // check if loggedIn
    if (checkLoggedIn(req)) {
        // the user is logged In, check for notifications
        const user = await userModel.getUser(new ObjectId(req.session.userId));
        const requestToFollowNotifications = user.requestToFollow.length;
        notifications += requestToFollowNotifications;
        // like notifications
        notifications += user.likeNotifications.length;
        // commentNotifications
        notifications += user.commentNotifications.length;
        // follow notifications
        notifications += user.followNotifications.length;

        // chat notifications
        notifications += user.chatNotifications.length;

    } // here ends the if
    // send the data
    res.json({amountNotifications: notifications})
} // here ends the function

/**
 * Fetches all the likes Notifications for a user
 * @param req
 * @param res
 * @param next
 * @returns {Promise<void>}
 */
async function getFetchLikesNotifications(req, res, next) {
    // check that the user is logged in
    if (!checkLoggedIn(req)) {
        // not logged in
        res.redirect('/login');
        return;
    }

    // now fetch all the notifications for the user requesting
    const user = await userModel.getUser(new ObjectId(req.session.userId));

    if (!user) {
        // there is no user
        next(new Error(`line 52 notification.controller-- no user`));
        return;
    }

    // now send all the likes notifications for the user
    res.json({notifications: user.likeNotifications })
}

/**
 * Controller to fetch all the comment notifications of the requester
 * @param {Express.Request} req
 * @param res
 * @param next
 * @returns {Promise<void>}
 */
async function getFetchCommentNotifications(req, res, next) {
    // check login
    if (!checkLoggedIn(req)) {
        // not logged in
        res.redirect('/login');
        return;
    }

    // now fetch the user
    const userId = new ObjectId(req.session.userId);
    const requestor = await userModel.getUser(userId);

    if (!requestor) {
        // no user
        next(new Error(`No user to fetch COmment notifications`));
        return;
    }

    // else return the commentNotifications
    res.json({notifications: requestor.commentNotifications});
} // here ends the function


async function getFetchFollowNotifications(req, res, next) {
    // check login
    if (!checkLoggedIn(req)) {
        // not logged in
        res.redirect('/login');
        return;
    }

    // now fetch the user
    const userId = new ObjectId(req.session.userId);
    const requestor = await userModel.getUser(userId);

    if (!requestor) {
        // no user
        next(new Error(`No user to fetch Follow notifications`));
        return;
    }

    // else return the commentNotifications
    res.json({notifications: requestor.followNotifications});
} // here ends the function

async function getFetchChatNotifications(req, res, next) {
    // logged in is checked before

    const userId = new ObjectId(req.session.userId);

    // get the user from the database
    const user = await userModel.getUser(userId);

    if (!user) {
        // no user
        next(new Error(`No user in the database even though is logged id`));
    }

    // all good
    // get the chat notifications
    const chatNotifications = user.chatNotifications;

    res.json({notifications: chatNotifications})
} // here ends getFetchChatNOtifications

async function deleteChatNotification(req, res, next) {
    // if has been cheked already if the user is authenticated
    // create a chatNotification data
    const chatData = {
        messageFromUsername: req.body.messageFromUsername,
        messageFrom: new ObjectId(req.body.messageFrom),
        date: req.body.date,
        content: req.body.content,
        chatId: new ObjectId(req.body.chatId)
    }
    // get the userId
    const userId = new ObjectId(req.session.userId);
    // delete the notification
    const result = await userModel.deleteChatNotification(userId, chatData);
    if (result) {
        // notification was deleted successfully
        res.json({result: true});
        return;
    } else {
        res.json({result: false});
        return;
    }
} // here ends deleteChatNotification

/**
 * Deletes a follow notification from the database for a given user
 * @param {Express.Request} req
 * @param res
 * @param next
 * @return {Promise<void>}
 */
async function deleteFollowNotification(req, res, next) {
    // get the userId
    const userId = new ObjectId(req.session.userId);
    // delete the notification
    const result = await userModel.deleteFollowNotification(userId, req.body);
    if (result) {
        res.json({result: result})
        return;
    }
    console.log('the notification was not deleded')
    res.json({result: false})
} // here ends deleteFollowNotification

/**
 * Simple controller to delete a comment notification
 * @param req
 * @param res
 * @return {Promise<void>}
 */
async function deleteCommentNotification(req, res) {
    // userId
    const userId = new ObjectId(req.session.userId);

    // get the date
    const date = req.body.date;

    // remove the notification
    const result = await userModel.deleteCommentNotification(userId, date);

    if (result) {
        res.json({result: true});
        return;
    }
    res.json({result: false})
} // end of deeletCommentNotfication

/**
 * Simple controller to delete a like notification from the database
 * @param req
 * @param res
 * @return {Promise<void>}
 */
async function deleteLikeNotification(req, res) {
    // get the userId
    const userId = new ObjectId(req.session.userId);
    // get the date of the notification
    const date = req.body.date;

    // delete the notification
    const result = await userModel.deleteLikeNotification(userId, date);

    if (result) {
        res.json({result: true});
        return;
    }

    res.json({result: false});
} // here ends deleteLikeNotfication


module.exports = {
    getFetchNotifications: getFetchNotifications,
    getFetchLikesNotifications: getFetchLikesNotifications,
    getFetchCommentNotifications: getFetchCommentNotifications,
    getFetchFollowNotifications: getFetchFollowNotifications,
    getFetchChatNotifications: getFetchChatNotifications,
    deleteChatNotification: deleteChatNotification,
    deleteFollowNotification: deleteFollowNotification,
    deleteCommentNotification: deleteCommentNotification,
    deleteLikeNotification: deleteLikeNotification
};