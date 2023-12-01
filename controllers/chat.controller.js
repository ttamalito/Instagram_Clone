const {checkLoggedIn} = require("../utils/checkLoggedIn");

function getChatsForUser(req, res, next) {
    // check log in
    if (!checkLoggedIn(req)) {
        res.redirect('/login');
        return;
    }

    // else render the page
    res.render('chat/chats')
}






module.exports = {
    getChatsForUser: getChatsForUser
}