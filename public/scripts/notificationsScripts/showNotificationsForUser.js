// get the notifications button
const notificationsButton = document.querySelector('#show-notifications-button');
const notificationsDiv = document.querySelector('#notifications-div');

// check if notificationsButton is not null
if (notificationsButton) {
    // fetch the amount of notifications of the user
    fetchAmountOfNotifications().then( n => {
        // see if the user has notifications
        if (n > 0) {
            // the user has notifications
            // show the button
            notificationsButton.style.visibility = 'visible';
            // set the textContent
            notificationsButton.textContent = `Show ${n} Notifications`
        }
    }).catch( err => {console.log(err)}) // end of fethcing the notifications
    // add an event listener
    notificationsButton.addEventListener('click', async e => {
            // first get the request to follow data
            fetchFollowRequestNotifications().then().catch()

            // fetch the likes Notification
            fetchLikesNotifications().then().catch()

            // fetch the comments notifications
            fetchCommentsNotifications().then().catch()

            // fetch the follow notifications
            fetchFollowNotifications().then().catch()

            // fetch the chat notifications
            fetchChatNotifications().then().catch();

            // now show the div
            notificationsDiv.style.visibility = 'visible';

        } // here ends callback
    ) // here ends the event listener of notifications Button
} // if -- the notificationsButton is not null






/**
 * Fuction to remove all children of an HTML element
 * @param parent
 */
function removeAllChildNodes(parent) {
    while (parent.firstChild) {
        parent.removeChild(parent.firstChild);
    }
}


/**
 * Fetches the amount of notifications for a user
 * @returns {Promise<number>}
 */
async function fetchAmountOfNotifications() {
    // fetch the amount of notifications that a user has
    const responseAmountNotifications = await fetch(`http://localhost:3000/fetchNotifications`, {
        method: 'GET',
        redirect: 'follow'
    })
// check if need to redirect
    if (responseAmountNotifications.redirected) {
        window.location.href = responseAmountNotifications.url
    }

// get the data
    const data = await responseAmountNotifications.json();
    return data.amountNotifications;
}


/**
 * Fetches the notifications to request to follow
 * and populates the list
 * @returns {Promise<void>}
 */
async function fetchFollowRequestNotifications() {
    const responseRequestToFollow = await fetch(`http://localhost:3000/user/notifications/requestToFollow/${notificationsButton.value}`, // this is the userId
        {
            method: 'GET',
            redirect: 'follow'
        });

    // check if redirected
    if (responseRequestToFollow.redirected) {
        window.location.href = responseRequestToFollow.url;
    }

    // get the data
    const dataRequestToFollow = await responseRequestToFollow.json();

    // now populate the list
    // but first empty it
    const requestToFollowlist = document.querySelector('#requestToFollow-list');
    removeAllChildNodes(requestToFollowlist);
    for (const notification of dataRequestToFollow.requestToFollow) {
        const li = document.createElement('li')
        const container = document.createElement('div');
        const anchorUser = document.createElement('a');
        anchorUser.textContent = notification.username;
        anchorUser.href = `/user/${notification.username}`;
        container.append(anchorUser);

        const buttonAccept = document.createElement('button');
        const buttonReject = document.createElement('button');

        buttonAccept.textContent = 'Accept';
        buttonAccept.value = `user/acceptFollow/${notification.username}`
        // add the event listener to the button to send the request to the server
        buttonAccept.addEventListener('click', async e => {
            // send a request
            const response = await fetch(`http://localhost:3000/${buttonAccept.value}`);
            // check if we need to redirect
            if (response.redirected) {
                window.location.href = response.url;
            }

            // get the result
            const data = await response.json();
            if (data.result) {
                // operation was successful
                // remove the list item from the list
                requestToFollowlist.removeChild(li);
                // change the text content of the show-notifications-button
                const liItems = requestToFollowlist.querySelectorAll('li');
                if (liItems.length > 0) {

                    notificationsButton.textContent = extractAndIncrementAmountOfNotifications(
                        notificationsButton.textContent, -1);
                } else {
                    if (extractAmountOfNotifications(notificationsButton.textContent) === 1) {
                        // there was only was notification, and it was removed, so close everything
                        notificationsButton.style.visibility = 'hidden';
                        notificationsDiv.style.visibility = 'hidden';
                        notificationsButton.textContent = '';
                    } else {
                        // decrease the amount of notifications by one
                        notificationsButton.textContent = extractAndIncrementAmountOfNotifications(
                            notificationsButton.textContent, -1);
                    }

                } // here ends the else of liItems.length > 0

            } // if data.result
        }); // end of eventListener of buttonAccept

        buttonReject.textContent = 'Reject';
        buttonReject.value = `user/rejectFollow/${notification.username}`;


        // add the event listener of the reject button
        buttonReject.addEventListener('click', async e => {
            // send a request
            const response = await fetch(`http://localhost:3000/${buttonReject.value}`);
            // check if we need to redirect
            if (response.redirected) {
                window.location.href = response.url;
            }

            // get the result
            const data = await response.json();
            if (data.result) {
                // operation was successful
                // remove the list item from the list
                requestToFollowlist.removeChild(li);
                // change the text content of the show-notifications-button
                const liItems = requestToFollowlist.querySelectorAll('li');
                console.log(liItems.length);
                if (liItems.length > 0) {

                    notificationsButton.textContent = extractAndIncrementAmountOfNotifications(
                        notificationsButton.textContent, -1);
                } else {
                    if (extractAmountOfNotifications(notificationsButton.textContent) === 1) {
                        // there was only was notification, and it was removed, so close everything
                        notificationsButton.style.visibility = 'hidden';
                        notificationsDiv.style.visibility = 'hidden';
                        notificationsButton.textContent = '';
                    } else {
                        // decrease the amount of notifications by one
                        notificationsButton.textContent = extractAndIncrementAmountOfNotifications(
                            notificationsButton.textContent, -1);
                    }

                } // here ends the else of liItems.length > 0


            } // if the operation was executed successfully
        }); // end of eventListener of buttonAccept

        container.append(buttonAccept);
        container.append(buttonReject);

        // now populate the list
        li.append(container);
        requestToFollowlist.append(li);

    } // here ends the for loop
} // here ends the function

/**
 * Fetches all the likes notifications that a user has and populates the list
 * @returns {Promise<void>}
 */
async function fetchLikesNotifications() {

    // fetch the likes
    const likesResponse = await fetch(`http://localhost:3000/fetchLikesNotifications`, {
        method: 'GET',
        redirect: 'follow'
    }) // here ends fetch

    // check if we need to redirect
    if (likesResponse.redirected) {
        window.location.href = likesResponse.url;
    }

    // get the data
    const data = await likesResponse.json();
    // now we can populate the list

   // get the HTML list to show the likes
   const notificationsLikesList = document.querySelector('#likes-list');
   // empty the list first
    removeAllChildNodes(notificationsLikesList);
   // populate li
    for (const notification of data.notifications) {
        const likeContainer = document.createElement('div');
        const anchorUser = document.createElement('a');
        anchorUser.href = `/user/${notification.senderUsername}`;
        anchorUser.textContent = notification.senderUsername;
        // add the anchor user to the container
        likeContainer.append(anchorUser);

        // simple paragraph
        const paragraph = document.createElement('p');
        paragraph.textContent = `liked your post`;
        likeContainer.append(paragraph);

        // the image
        const image = document.createElement('img');
        image.src = `/static/images/${notification.imagePath}`;
        image.style.width = '50px'
        image.style.height = '50px'
        likeContainer.append(image)


        // add the container to a li and to the ul
        const li = document.createElement('li');
        li.append(likeContainer);
        notificationsLikesList.append(li);
    } // here ends the for loop of notifications



} // here ends the function

/**
 * Fetches all comment notifications
 * @returns {Promise<void>}
 */
async function fetchCommentsNotifications() {
    // fetch the comments
    const commentsResponse = await fetch(`http://localhost:3000/fetchCommentNotifications`, {
        method: 'GET',
        redirect: 'follow'
    }) // here ends fetch

    // check if we need to redirect
    if (commentsResponse.redirected) {
        window.location.href = commentsResponse.url;
    }

    // get the data
    const data = await commentsResponse.json();

    // get the HTML list to show the likes
    const notificationsCommentsList = document.querySelector('#comments-list');
    // empty the list first
    removeAllChildNodes(notificationsCommentsList);
    // populate the list
    for (const notification of data.notifications) {
        const commentContainer = document.createElement('div');
        const anchorUser = document.createElement('a');
        anchorUser.href = `/user/${notification.senderUsername}`;
        anchorUser.textContent = notification.senderUsername;
        // add the anchor user to the container
        commentContainer.append(anchorUser);

        // simple paragraph
        const comment = document.createElement('p');
        comment.textContent = `commented your post`;
        commentContainer.append(comment);

        // the image
        const image = document.createElement('img');
        image.src = `/static/images/${notification.imagePath}`;
        image.style.width = '20px'
        image.style.height = '20px'
        commentContainer.append(image)


        // add the container to a li and to the ul
        const li = document.createElement('li');
        li.append(commentContainer);
        notificationsCommentsList.append(li);
    } // here ends the for loop of notifications
} // here ends the function

/**
 * Fetches all the follow notifications for a user
 * and populates the list
 * @returns {Promise<void>}
 */
async function fetchFollowNotifications() {
    // fetch the follow notification
    const followResponse = await fetch(`http://localhost:3000/fetchFollowNotifications`, {
        method: 'GET',
        redirect: 'follow'
    }) // here ends fetch

    // check if we need to redirect
    if (followResponse.redirected) {
        window.location.href = followResponse.url;
    }

    // get the data
    const data = await followResponse.json();

    // get the HTML list to show the likes
    const notificationsFollowList = document.querySelector('#follow-list');
    // empty the list first
    removeAllChildNodes(notificationsFollowList);
    // populate the list
    for (const notification of data.notifications) {
        const followContainer = document.createElement('div');
        const anchorUser = document.createElement('a');
        anchorUser.href = `/user/${notification.senderUsername}`;
        anchorUser.textContent = notification.senderUsername;
        // add the anchor user to the container
        followContainer.append(anchorUser);

        // simple paragraph
        const p = document.createElement('p');
        p.textContent = `started following you`;
        followContainer.append(p);

        // add the container to a li and to the ul
        const li = document.createElement('li');
        li.append(followContainer);
        notificationsFollowList.append(li);
    } // here ends the for loop of notifications
} // here ends the function

/**
 * Fetches all the chat notifications for a user and populates the list
 * @return {Promise<void>}
 */
async function fetchChatNotifications() {

    // fetch them
    const response = await fetch(`http://localhost:3000/fetchChatNotifications`, {
        method: 'GET',
        redirect: 'follow'
    })

    // check if we need to redirect
    if (response.redirected) {
        window.location.href = response.url;
    }

    // get the data
    const data = await response.json();
    console.log(data)

} // here ends fetchChatNotifications

/**
 * Extracts the amount of notifications from the string 'Show X Notifications'
 * @param {String} amount The string
 * @param {number} toAdd The amount to increment the Show X NOtifications text
 * @returns {string}
 */
function extractAndIncrementAmountOfNotifications(amount, toAdd = 0) {
    const separatedArray = amount.split(' ');
    const n = parseInt(separatedArray[1]) + toAdd;
    return `Show ${n.toString()} Notifications`
}

/**
 * Returns the amount of remaining notifications
 * @param {String} textContent
 * @returns {number} The amount of remaining notifications
 */
function extractAmountOfNotifications(textContent) {
    const separatedArray = textContent.split(' ');
    return parseInt(separatedArray[1]);
}
