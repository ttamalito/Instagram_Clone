/**
 * Sets the Access-Control-Allow-Origin header to accept requests only from
 * localhost:8080
 * @param {Express.Request} req
 * @param {Express.Response} res
 * @param next
 */
function addCORSHeader(req, res, next) {
    res.append('Access-Control-Allow-Origin', 'http://localhost:8080');
    res.append('Access-Control-Allow-Credentials', 'true');
    res.append('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.append('Access-Control-Allow-Headers', 'append,delete,entries,foreach,get,has,keys,set,values,Authorization')
    next()
}

module.exports = addCORSHeader;