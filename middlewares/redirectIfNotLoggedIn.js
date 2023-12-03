const {checkLoggedIn} = require("../utils/checkLoggedIn");

/**
 * Checks if a user is logged in, if not it redirects to /login
 * @param req
 * @param res
 * @param next
 */
function redirectIfNotLoggedIn(req, res, next) {
    if (!checkLoggedIn(req)) {
        res.redirect('/login');
        return;
    }

    // else the user is logged in
    next();
} // here ends the function

module.exports = redirectIfNotLoggedIn;