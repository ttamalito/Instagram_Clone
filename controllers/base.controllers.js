const userModel = require('../models/user.model');
const {checkLoggedIn} = require("../utils/checkLoggedIn");
const ObjectId = require('mongodb').ObjectId;
/**
 *
 * @param req
 * @param res
 * @param next
 * @returns {Promise<void>}
 */
async function base(req, res, next) {
    let notifications = 0;

    // check if loggedIn
    if (checkLoggedIn(req)) {
        // the user is logged In, check for notifications
        const user = await userModel.getUser(new ObjectId(req.session.userId));
        const requestToFollowNotifications = user.requestToFollow.length;
        // add the request to follow notifications
        notifications += requestToFollowNotifications;
    } // here ends the if

    // get the amount of notifications that a user has

    // just render the initial file
    res.render('index', {
        posts: [],
        amountNotifications: notifications
    });
}



module.exports = {
    base: base
}