const storiesObject = require('./Stories');
const userModel = require('../models/user.model');

/**
 * Fetches all the stories from the database and adds them to the stories object, to handle the deletion at the respective time
 */
function fetchStories() {

    userModel.fetchAllStories().then(array => {
        for (const {_id, stories} of array) {
            for (const story of stories) {

                storiesObject.addStoryToMapOnly(_id.toString(), story.filename, story.dateCreated, story.dateToBeDeleted)
                console.log(`Added ${story.filename} after fetching from disk`)
            }
        }
    })
}

module.exports = fetchStories;