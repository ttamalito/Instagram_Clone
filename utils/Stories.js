const fs = require('node:fs')
const path = require('node:path');

class Stories {
    constructor() {
        /**
         * Stores the userId and date of a story of a given user, with the key being the fileName
         * @type {Map<String, StoryObject>}
         */
        this.storiesMap = new Map() // map to store the userId and date of a story
    } // here ends the constructor

    /**
     * Deletes the story for a given user, identifying it by the fileName
     * @param {String} userId
     * @param {String} fileName Name of the file for the corresponding story
     * @return {Promise<void>}
     */
    async deleteStory(userId, fileName) {

        // check that the user has a story, with the given file
        if (!this.checkUserHasStoryWithFileName(userId, fileName))
            throw new Error(`Trying to delete non-existent story`);

        // delete the file
        // get the path to the file
        const pathToFile = path.join('./data/stories', fileName);
        // delete the data from the database
        // TODO
        fs.unlink(pathToFile, err => {
            if (err) throw err;
            // else the file was deleted
            // delete the instance in the stories map
            this.storiesMap.delete(fileName);
        }) // end of unlink
    } // end of deleteStory

    /**
     * Checks if there is a story with a specific fileName for a user
     * @param {String} userId
     * @param {String} fileName
     * @return {boolean} true if there is a corresponding entry in the map
     */
    checkUserHasStoryWithFileName(userId, fileName) {
        if (this.storiesMap.has(fileName)) {
            const story = this.storiesMap.get(fileName);
            return story['userId'] === userId;
        }
        return false;
    } // end of function

    /**
     * Deletes all the stories that have a date smaller than the argument passed
     * @param {number} date The current date in milliseconds
     * @return {Promise<void>}
     */
    async deleteStories(date) {
        /**
         *
         * @type {*[[String, String]]}
         */
        const toDelete = []
        for (let [key, value] of this.storiesMap) {
            // if the date to be deleted has already passed
            if (value['dateToBeDeleted'] <= date) {
                // add the key and userId to the array to be deleted
                toDelete.push([key, value['userId']]);
            } // end of if
        } // end of for loop
        for (const [file, userId] of toDelete) {
            await this.deleteStory(userId, file);
        }
    } // end of deletStories

    /**
     * Adds a story to the map
     * @param {String} fileName
     * @param {String} userId
     */
    addStory(fileName, userId) {
        // compute the current date
        const date = Date.now();
        // compute the date to be deleted
        // in 24 hours there are 86.4 million ms
        // const dateToBeDeleted = date + 86400000;
        // for now do it for 5 minutes (300k milliseconds)
        const dateToBeDeleted = date + 300000;
        // create the object
        const obj = {
            userId: userId,
            dateCreated: date,
            dateToBeDeleted: dateToBeDeleted
        }
        // add it to the map
        this.storiesMap.set(fileName, obj);
    }
} // here ends the Stories class



/**
 * @typedef {Object} StoryObject
 *
 * @param {String} userId
 * @param {number} dateCreated
 * @param {number} dateToBeDeleted
 */

// instantiate the only Stories object
const stories = new Stories();

module.exports = stories;