/**
 * Add the CsrfToken to the locals variable
 * @param req
 * @param res
 * @param next
 */
function addCsrfToken(req, res, next) {
    res.locals.csrfToken = req.csrfToken();
    next(); // go to the next middleware
}

module.exports = addCsrfToken;