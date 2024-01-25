const fs = require('node:fs')
const path = require('node:path');
const userModel = require('../models/user.model');
const ObjectId = require('mongodb').ObjectId;
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
     *
     */
    deleteStory(userId, fileName) {

        // check that the user has a story, with the given file
        if (!this.checkUserHasStoryWithFileName(userId, fileName))
            throw new Error(`Trying to delete non-existent story`);

        // delete the file
        // get the path to the file
        const pathToFile = path.join('./data/stories', fileName);
        // delete the data from the database
        // create an object id
        const objectIdUser = new ObjectId(userId);
        userModel.deleteStory(objectIdUser, fileName).then(res => {
            if (!res)
                throw new Error(`Could not delete a Story from the database for ${fileName}`);
            // else the story was deleted, delete the file
            fs.unlink(pathToFile, err => {
                if (err) throw err;
                // else the file was deleted
                // delete the instance in the stories map
                this.storiesMap.delete(fileName);
                console.log(`line 41 Stories.js -- deleted: ${fileName}`);
            }) // end of unlink
        }).catch(err => console.error(err));

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
     *
     */
    deleteStories(date) {
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
            this.deleteStory(userId, file);
        }
    } // end of deletStories

    /**
     * Adds a story to the map and to the database.
     * @param {String} fileName
     * @param {String} userId
     * @param {String} mimeType MIME Type of the file to be stored
     */
    addStory(fileName, userId, mimeType) {
        // check if there is a key value pair with that name
        if (this.storiesMap.has(fileName)) {
            return;
        }
        // compute the current date
        const date = Date.now();
        // compute the date to be deleted
        // in 24 hours there are 86.4 million ms
        // const dateToBeDeleted = date + 86400000;
        // for now do it for 10 minutes (600k milliseconds)
        const dateToBeDeleted = date + 600000;
        // create the object
        const obj = {
            userId: userId,
            dateCreated: date,
            dateToBeDeleted: dateToBeDeleted
        }
        // add it to the map
        this.storiesMap.set(fileName, obj);
        // add it to the database
        userModel.addStory(new ObjectId(userId), fileName, date, dateToBeDeleted, mimeType).then(res => {
            if (!res)
                throw new Error(`Could not add Story for ${fileName}`);
            // else it was deleted successfully

            console.log(`We added: ${fileName} as a story`);
        }).catch(err => {console.error(err)})

    } // ends addStory

    /**
     * Adds a story to the map only (Saved in Memory)
     * @param {String} userId
     * @param {String} filename
     * @param {number} dateCreated
     * @param {number} dateToBeDeleted
     */
    addStoryToMapOnly(userId, filename, dateCreated, dateToBeDeleted) {
        if (this.storiesMap.has(filename)) {
            return;
        }
        const obj = {
            userId: userId,
            dateCreated: dateCreated,
            dateToBeDeleted: dateToBeDeleted
        }
        // add it to the map
        this.storiesMap.set(filename, obj);

    } // ends addStoryToMapOnly
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