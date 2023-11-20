// import function from another script
// const removeChildren = require('../post-comment');


// get the button to display the followers
const displayFollowersButton = document.querySelector('#display-followers');
// button to close the followers display
const closeFollowersDisplay = document.querySelector('#close-followers');

// add an event listener
displayFollowersButton.addEventListener('click', async e => {
    // make the closeFollowersDisplay button visible
    closeFollowersDisplay.style.visibility = 'visible';
    // make the div of followers visible
    const followersDiv = document.querySelector('#followers-div');
    followersDiv.style.visibility = 'visible';

    // make the button invisible
    displayFollowersButton.style.visibility = 'hidden';

    // fetch all the followers
    const response = await fetch(`http://localhost:3000/user/${displayFollowersButton.value}/followers`,
        {
            method: 'GET',
            redirect: 'follow'
        }); // here ends fetch

    // check if redirect is needed

    console.log(response)

    if (response.redirected) {
        window.location.href = response.url;
    }

    // get the data
    const data = await response.json();
    const followers = data.followers;
    console.log(`displayAndCloseFollowers line 36: followers : ${followers}`);
    // populate the unordered list
    const followersList = document.querySelector('#followers-list');
    // remove all previous elements
    removeAllChildNodes(followersList);
    // populate it
    for (const follower of followers) {
        populateListWithData(followersList, follower);
    }
    } // here ends the callback
);


// logic to stop displaying the followers
// get the corresponding button

// add the corresponding event listener
closeFollowersDisplay.addEventListener('click', e => {
    // make the button invisible
    closeFollowersDisplay.style.visibility = 'hidden';
    // make the display followers button visible
    displayFollowersButton.style.visibility = 'visible';
    // empty the list
    const followersList = document.querySelector('#followers-list');
    // remove all previous elements
    removeAllChildNodes(followersList);
    // make the div invisible
    const followersDiv = document.querySelector('#followers-div');
    followersDiv.style.visibility = 'hidden';

    } // here ends the callback
); // here ends the event listener








/**
 * Populate an unordered list with data
 * @param {HTMLUListElement} ul
 * @param data
 */
function populateListWithData(ul, data) {
    let li = document.createElement('li');
    ul.append(`${data}`, li);
}
