const {checkLoggedIn} = require("../utils/checkLoggedIn");
const ObjectId = require('mongodb').ObjectId
const chatModel = require('../models/chat.model')
const userModel = require('../models/user.model');

async function getChatsForUser(req, res, next) {

    if (req.session.userId !== req.params.userId) {
        // user is trying to access someone elses chats
        res.redirect('/');
        return;
    }



    // get the user id
    const userId = new ObjectId(req.session.userId);

    const chats = await chatModel.getChatsForUser(userId);

    res.json({chats: chats});

}

/**
 * Render the intial inbox page
 * @param req
 * @param res
 * @param next
 */
function renderInbox(req, res, next) {

    // check log in
    if (!checkLoggedIn(req)) {
        res.redirect('/login');
        return;
    }

    // else render the page
    res.render('chat/chats')
}


/**
 * Controller to save and start a new singles chat
 * @param req
 * @param res
 * @param next
 * @returns {Promise<void>}
 */
async function postCreateNewChat(req, res, next) {
    // login has been checked by the middleware

    // get the data from the req.body
    const partner = req.body.partner;
    const partnerObject = await userModel.retrieveUserByUsername(partner);
    // ObjectId
    const partnerId = partnerObject._id;
    const userId = new ObjectId(req.session.userId);
    // ObjectId[]
    const users = [userId, partnerId];
    const params = {
        users: users,
        groupChat: {
            isGroupChat: false,
            owner: null,
            groupPictureFileName: ''
        }
    } // here ends params

    const chatId = await chatModel.saveNewChat(params);

    // save the chat to both users
    const saveChatOne = await userModel.saveChat(userId, chatId);
    const saveChatTwo = await userModel.saveChat(partnerId, chatId);

    if(!saveChatOne || !saveChatTwo)
        next(new Error(`Could not save chat to some user`));
    // else all good
    // redirect to inbox
    res.redirect('/chat/inbox');

}

/**
 * Renders the page to startNewChat
 * @param req
 * @param res
 * @param next
 * @returns {Promise<void>}
 */
async function getStartNewChat(req, res, next) {
    // login was checked beforehand
    // get all the people that the user if following
    const userId = new ObjectId(req.session.userId);

    const user = await userModel.getUser(userId);
    const following = await Promise.all(
        user.following.map(async u => {
            const customer = await userModel.getUser(u);
            return {username: customer.username}
        })
    ) // here ends Promise.all

    res.render('chat/startNewChat', {following: following})
}





module.exports = {
    getChatsForUser: getChatsForUser,
    renderInbox: renderInbox,
    getStartNewChat: getStartNewChat,
    postCreateNewChat: postCreateNewChat
}