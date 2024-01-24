const stories = require('./Stories');
function infiniteChecker(date) {
    // execute the logic to delete the stories
    console.log('About to delete stories')
    stories.deleteStories(date)
    setTimeout(() => infiniteChecker(Date.now()), 30000); {
    }
}


module.exports = infiniteChecker;