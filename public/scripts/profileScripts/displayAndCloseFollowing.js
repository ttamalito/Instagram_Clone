// import function from another script
// const removeChildren = require('../post-comment');


// get the button to display the followers
const displayFollowingButton = document.querySelector('#display-following');
// button to close the followers display
const closeFollowingDisplay = document.querySelector('#close-following');

// add an event listener
displayFollowingButton.addEventListener('click', async e => {
        // make the closeFollowingDisplay button visible
        closeFollowingDisplay.style.visibility = 'visible';
        // make the div of followers visible
        const followingDiv = document.querySelector('#following-div');
        followingDiv.style.visibility = 'visible';

        // make the button invisible
        displayFollowingButton.style.visibility = 'hidden';

        // fetch all the followers
        const response = await fetch(`http://localhost:3000/user/${displayFollowingButton.value}/following`,
            {
                method: 'GET',
                redirect: 'follow'
            }); // here ends fetch

        // check if redirect is needed
        if (response.redirected) {
            window.location.href = response.url;
        }

        // get the data
        const data = await response.json();
        const following = data.following;
        // populate the unordered list
        const followingList = document.querySelector('#following-list');
        // remove all previous elements
        removeAllChildNodes(followingList);
        // populate it
        for (const userFollowing of following) {
            populateListWithData(followingList, userFollowing);
        }
    } // here ends the callback
);


// logic to stop displaying the followers
// get the corresponding button

// add the corresponding event listener
closeFollowingDisplay.addEventListener('click', e => {
        // make the button invisible
        closeFollowingDisplay.style.visibility = 'hidden';
        // make the display following button visible
        displayFollowingButton.style.visibility = 'visible';
        // empty the list
        const followingList = document.querySelector('#following-list');
        // remove all previous elements
        removeAllChildNodes(followingList);
        // make the div invisible
        const followingDiv = document.querySelector('#following-div');
        followingDiv.style.visibility = 'hidden';

    } // here ends the callback
); // here ends the event listener
