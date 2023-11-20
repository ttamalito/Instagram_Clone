const {checkLoggedIn} = require("../utils/checkLoggedIn");
const connectionsMap = require('../utils/connectionsMap');

function saveConnection(req, res, next) {
    // check that the user is logged in
    if (!checkLoggedIn(req)) {
        // user not logged in
        next(); // go to the next middleware
    }

    // else the user is logged in
    // check if the user has already a connection
    //console.log(res.req.url);
    next();

}

module.exports = saveConnection;