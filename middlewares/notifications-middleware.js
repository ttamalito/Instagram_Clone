const userModel = require('../models/user.model');
const {checkLoggedIn} = require("../utils/checkLoggedIn");
const {ObjectId} = require("mongodb");


async function fetchNotifications(req, res, next) {
    let notifications = 0;
    // console.log(`We want to fetch notifications yeey!`)
    // check if loggedIn
    if (checkLoggedIn(req)) {
        // the user is logged In, check for notifications
         const user = await userModel.getUser(new ObjectId(req.session.userId));
         const requestToFollowNotifications = user.requestToFollow.length;
        // console.log(`The user is logged in: ${req.session.userId}`)
        /*
        userModel.getUser(new ObjectId(req.session.userId)).then(
            // promise was resolved
            (userFound) => {
                console.log(`His username is ${userFound.username}`);
                notifications += userFound.requestToFollow.length;
                console.log(`He has ${notifications} notifications`);
            }
        ).catch(
            (error) => {console.log(error);
                next(error) }

        ) // here ends the promise
         */
        notifications += requestToFollowNotifications;

    } // here ends the if
    // console.log(`He has ${notifications} notifications after if`);
    // put the notifications to the locals variable
    res.locals.amountNotifications = notifications;
    // go to the next middleware
    next();
}


module.exports = fetchNotifications;