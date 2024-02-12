/**
 * Extracts the username from the string
 * The string comes in the form /username
 * @param {String} url
 * @returns {String} the username
 */
function extractUsername(url) {

    let userId = '';
    for (let i = 1; i < url.length; i++) {
        userId += url.charAt(i)
    }
    return userId
}

module.exports = extractUsername