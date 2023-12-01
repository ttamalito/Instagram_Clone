/**
 * Extracts the user if from the string
 * The string comes in the form /98298393
 * @param {String} url
 * @returns {String} the userId (654654)
 */
function extractUserId(url) {

    let userId = '';
    for (let i = 1; i < url.length; i++) {
        userId += url.charAt(i)
    }
    return userId
}

module.exports = extractUserId