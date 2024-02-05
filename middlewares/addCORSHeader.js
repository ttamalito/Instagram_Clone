/**
 * Sets the Access-Control-Allow-Origin header to accept requests only from
 * localhost:8080
 * @param {Express.Request} req
 * @param {Express.Response} res
 * @param next
 */
function addCORSHeader(req, res, next) {
    res.append('Access-Control-Allow-Origin', 'http://localhost:8080');
    next()
}

module.exports = addCORSHeader;