/**
 * Checks if a user is loggedIn
 * @param {Express.Request} req
 * @returns {boolean} true if the user is logged in, false otherwise
 */
 function checkLoggedIn(req) {
     const loggedIn = req.session.userId;

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