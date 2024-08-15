const stories = require('./Stories');

/**
 * Checks if some story needs to be deleted every 60 seconds
 * @param {number} date The current date in milliseconds from 1970
 */
function infiniteChecker(date) {
    // execute the logic to delete the stories
    console.log('About to delete stories')
    stories.deleteStories(date)
    setTimeout(() => infiniteChecker(Date.now()), 3600000); {
    }
}


module.exports = infiniteChecker;