const {checkLoggedIn} = require("../utils/checkLoggedIn");
const ObjectId = require('mongodb').ObjectId
const chatModel = require('../models/chat.model')
const userModel = require('../models/user.model');
const refactoChatsUtils = require('../utils/chatUtils/refactorChatToSend');
const {checkUserIsPartOfChat} = require("../utils/chatUtils/utilityFunctionsForChatController");
const messageModel = require('../models/message.model')
const globalVariables = require('../utils/global');

/**
 * Controller to send back all the chats of a logged in user
 * @param req
 * @param res
 * @param next
 * @return {Promise<void>}
 */
async function getChatsForUser(req, res, next) {

    // get the user id
    const userId = new ObjectId(req.session.userId);

    let chats = await chatModel.getChatsForUser(userId);
    // refactor every single chat
    chats = await Promise.all(
        chats.map(async chat => {
            return await refactoChatsUtils.refactorSingleChatObjectToBeSent(chat, userId);
        })
    )

    res.json({
        result: true,
        chats: chats});

}

/**
 * Render the initial inbox page
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
    res.json({result: true});

}

/**
 * Sends the CSRF token so that a user can make the post request to start a new chat
 * @param req
 * @param res
 * @param next
 * @returns {Promise<void>}
 */
async function getStartNewChat(req, res, next) {
    // login was checked beforehand
    // get all the people that the user if following
    res.json({result: true,
    csrf: req.csrfToken()});
}

/**
 * Controller to fetch all the messages from a chat
 * @param req
 * @param res
 * @param next
 * @return {Promise<void>}
 */
async function getMessagesForChat(req, res, next) {
    // login was checked beforehand
    const chatId = new ObjectId(req.params.chatId);

    const chat = await chatModel.getChat(chatId);
    const userId = new ObjectId(req.session.userId)
    // check if the user is part of the chat
    if (!checkUserIsPartOfChat(chat.users, userId)) {
        // user is not part of the chat
        res.json({
            result: false,
            url: `${globalVariables.frontend}`
        })
        return;
    }

    // now get all the messages
    const messages = await messageModel.getMultipleMessages(chat.messages);

    res.json({
        result: true,
        messages: messages});
} // end of controller



module.exports = {
    getChatsForUser: getChatsForUser,
    renderInbox: renderInbox,
    getStartNewChat: getStartNewChat,
    postCreateNewChat: postCreateNewChat,
    getMessagesForChat: getMessagesForChat
}