// get the notifications button
const notificationsButton = document.querySelector('#show-notifications-button');
const notificationsDiv = document.querySelector('#notifications-div');
// add an event listener
notificationsButton.addEventListener('click', async e => {
    // first get the request to follow data
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
    console.log(dataRequestToFollow);

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
                console.log(liItems.length);
                if (liItems.length > 0) {
                    notificationsButton.textContent = `Show ${liItems.length} Notifications`;
                } else {
                    notificationsButton.style.visibility = 'hidden';
                    notificationsDiv.style.visibility = 'hidden';
                }

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
                    notificationsButton.textContent = `Show ${liItems.length} Notifications`;
                } else {
                    notificationsButton.style.visibility = 'hidden';
                    notificationsDiv.style.visibility = 'hidden';
                }


            } // if the operation was executed successfully
        }); // end of eventListener of buttonAccept

        container.append(buttonAccept);
        container.append(buttonReject);

        // now populate the list
        li.append(container);
        requestToFollowlist.append(li);

    } // here ends the for loop
    // now show the div
    notificationsDiv.style.visibility = 'visible';

    } // here ends callback
) // here ends the event listener of notifications Button




/**
 * Fuction to remove all children of an HTML element
 * @param parent
 */
function removeAllChildNodes(parent) {
    while (parent.firstChild) {
        parent.removeChild(parent.firstChild);
    }
}
