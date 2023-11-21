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

        notifications += user.likeNotifications.length;

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
        next(new Error(`line 46 notification.controller-- no user`));
        return;
    }

    // now send all the likes notifications for the user
    res.json({notifications: user.likeNotifications })
}


module.exports = {
    getFetchNotifications: getFetchNotifications,
    getFetchLikesNotifications: getFetchLikesNotifications
};