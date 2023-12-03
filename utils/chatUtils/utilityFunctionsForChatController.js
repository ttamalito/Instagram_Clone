/**
 * Checks if a user is part of the chat
 * @param users
 * @param userId
 * @return {boolean}
 */
function checkUserIsPartOfChat(users, userId) {
    for (const user of users) {
        if (user.equals(userId))
            return true;
    }
    return false;
}


module.exports = {
    checkUserIsPartOfChat: checkUserIsPartOfChat
}