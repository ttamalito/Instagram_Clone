/**
 * Checks if the user is logged in with the help of a session
 * @param req
 * @param res
 * @param next
 */
function checkLogin(req, res, next) {
    // check the session data
    const userId = req.session.userId;
    const username = req.session.username;
    if (userId) {
        // the user is logged in
        res.locals.loggedIn = true;
        res.locals.userId = userId;
        res.locals.username = username;
    }
    next(); // go tot the next middleware
}

module.exports = checkLogin;