/**
 * Checks if the user is logged in with the help of a session
 * @param req
 * @param res
 * @param next
 */
function checkLogin(req, res, next) {
    // check the session data
    const userId = req.session.userId;
    if (userId) {
        // the user is logged in
        res.locals.isLoggedIn = true;
        res.locals.userId = userId;
    }
    next(); // go tot the next middleware
}

module.exports = checkLogin;