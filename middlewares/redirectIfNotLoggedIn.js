const {checkLoggedIn} = require("../utils/checkLoggedIn");

const global = require('../utils/global');

/**
 * Checks if a user is logged in, if not it
 * sends a json with a redirect link pointing to frontend/login
 * @param req
 * @param res
 * @param next
 */
function redirectIfNotLoggedIn(req, res, next) {
    if (!checkLoggedIn(req)) {
        res.json({
            result: false,
            url: `${global.frontend}/login`
        })
        return;
    }
    // else the user is logged in
    next();
} // here ends the function

module.exports = redirectIfNotLoggedIn;