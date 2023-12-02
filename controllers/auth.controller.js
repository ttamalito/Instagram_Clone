const checkloggedInUtils = require('../utils/checkLoggedIn');
const userModel = require('../models/user.model');

const userConnections = require('../utils/userConnections');

/**
 * Get route for /signup
 * @param req
 * @param res
 * @param next
 */
function getSignUp(req, res, next) {
    // checked if logged in
    if (checkloggedInUtils.checkLoggedIn(req)) {
        // he is logged in
        res.redirect('/');
        return;
    }

    // else
    // render the page
    res.render('auth/signup');
}

/**
 * Validates and saves a user to the database
 * @param req
 * @param {Express.Response} res
 * @param next
 * @returns {Promise<void>}
 */
async function postSignUp(req, res, next) {
    // get the data and validate it
    // TODO
    // still missing validation of the data
    const email = req.body.email;
    const password = req.body.password;
    const username = req.body.username;
    const bio = req.body.bio;
    const fullname = req.body.fullname;

    // check that there is a unique email and username
    const uniqueEmail = await userModel.checkUniqueEmail(email);

    // check if email is unique
    if (!uniqueEmail) {
        // not unique email
        res.redirect('/signup');
        return;
    }

    const uniqueUsername = await userModel.checkUniqueUsername(username);

    if (!uniqueUsername) {
        // not unique username
        res.redirect('/signup');
        return;
    }

    // otherwise we save the user to the database
     await userModel.saveUser(email, password, username, bio, fullname);
    // redirect to login
    res.redirect('/login');
} // here ends the function

/**
 * /login (GET)
 * @param req
 * @param res
 * @param next
 */
function getLogin(req, res, next) {
    // check loggedIn
    const loggedIn = checkloggedInUtils.checkLoggedIn(req);
    if (loggedIn) {
        // user is logged in
        res.redirect('/');
        return;
    }

    // else render
    res.render('auth/login');
} // here ends the page

async function postLogin(req, res, next) {
    // get the data
    const email = req.body.email;
    let username = req.body.username;
    const password = req.body.password;

    // check that the user exists
    const userEmail = await userModel.retrieveUserByEmail(email);
    if (username) {
        // the client provided a username
        username = await userModel.retrieveUserByUsername(username);
    } else {
        // the client did not provide a username
        username = true;
    }
    if (!username || !userEmail) {
        // there is no user
        console.log('There is no user with that email or username');
        res.redirect('/login');
        return;
    }

    // now the user exists
    const hashedPassword = userEmail.password;
    // check if the password matches
    const matchingPassword = await userModel.hasMatchingPassword(password, hashedPassword);
    if (!matchingPassword) {
        // password doesnt match
        res.redirect('/login');
        return;
    }

    // otherwise the user can log in
    req.session.userId = userEmail._id.toString();
    req.session.username = userEmail.username;
    // console.log(res.getHeaders());
    req.session.save(() => {
        // redirect once the session was modified
        res.redirect('/');
    })

} // here ends postLogin

/**
 * Removes the data from the session and deletes the
 * server sent connection if the user had one
 * @param req
 * @param res
 * @param next
 */
function postLogout(req, res, next) {
    // check that the user is loggedIn
    const loggedIn = checkloggedInUtils.checkLoggedIn(req);
    if (!loggedIn) {
        console.log('user is not logged in and trying to logout!');
        // user is not loggedIN
        res.redirect('/');
        return;
    }
    // the userId
    const userId = req.session.userId;
    // delete the connection if the user had one
    if (userConnections.hasUserConnections(userId)) {
        // he has a connection
        // TODO
        // Close the websocket connection
        userConnections.closeWebSocketConnectionForUser(userId)
        userConnections.deleteConnectionsForUser(userId)
    }

    // else delete the data from the session
    req.session.userId = null;
    req.session.username = null;


    // all good
    res.redirect('/');
} // here ends postLogout



module.exports = {
    getSignUp: getSignUp,
    postSignUp: postSignUp,
    getLogin: getLogin,
    postLogin: postLogin,
    postLogout: postLogout
}