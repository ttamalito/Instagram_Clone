
const userModel = require('../../models/user.model');
/**
 * Method to refactor the Object of the single chat to be sent
 * It finds who is the user to which the requester is chatting
 * @param {Chat} chat
 * @param {ObjectId} requestee
 * @return {Promise<{
 *                  userId: String,
 *                 partnerUsername: String,
 *                 partnerUserId: String,
 *                 messages: [ObjectId],
 *                 media: [Object]}>} The new chat object
 *
 *@throws {Error} if chat couldnt be refactor properly
 */
async function refactorSingleChatObjectToBeSent(chat, requestee) {

    // get the users
    const users = chat.users; // length == 2
    for (const userId of users) {
        if (!userId.equals(requestee)) {
            // we found it
            const partner = await userModel.getUser(userId);
            return {
                chatId: chat._id.toString(),
                userId: requestee.toString(),
                partnerUsername: partner.username,
                partnerUserId: partner._id.toString(),
                messages: chat.messages,
                media: chat.media
            }
        }
    }
    // somehow we never found anything
    throw new Error(`No partner found when fetching chats`);
} // here ends the function


module.exports = {
    refactorSingleChatObjectToBeSent: refactorSingleChatObjectToBeSent
}