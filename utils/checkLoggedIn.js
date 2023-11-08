/**
 * Checks if a user is loggedIn
 * @param {Express.Request} req
 * @returns {boolean}
 */
 function checkLoggedIn(req) {
     const loggedIn = req.sesssion.userdId;

     if(loggedIn) {
         // he is logged in
         return true;
     }

     // else he is not logged in
     return false;
 }

 module.exports = {
     checkLoggedIn: checkLoggedIn
 }