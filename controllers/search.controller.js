const userModel = require('../models/user.model');

/**
 * Retreives a user from the query parameters given by the user
 * @param req
 * @param res
 * @param next
 * @returns {Promise<void>}
 */
async function getSearchUser(req, res, next) {
    // get the query parameter
    const username = req.query.username;

    // get the user
    const user = await userModel.retrieveUserByUsername(username);

    // check if null
    if (!user) {
        // no user
        res.json({user: null});
        return;
    }

    // else there is a user
    res.json({user: user.username})
} // here ends the method


module.exports = {
    getSearchUser: getSearchUser
}