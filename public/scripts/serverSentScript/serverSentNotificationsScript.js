
const sse = new EventSource('http://localhost:3000/open-connection');
sse.onmessage = console.log;
sse.onopen = () => {console.log(`we have opened the connection`)};


// add a testing event listener
sse.addEventListener('testing', (e) => {
    const data = e.data;
    const parsedData = JSON.parse(data);
    console.log(parsedData.hello);

})


// event to receive a like
sse.addEventListener('like', e => {
    console.log(e);
    console.log('You received a like!');
    const data = e.data;
    console.log(data)
    // console.log(data);
    // update the counter of notifications
    modifyNotificationsButton();
});

sse.addEventListener('comment', e => {
    // what to do on the evet
    console.log('You received a comment!');
    const data = e.data;
    console.log(data)
    // modify the notifications button
    modifyNotificationsButton();
});

sse.addEventListener('new_follower', e => {
    console.log('You have a new follower');
    const data = e.data;
    console.log(data)
    // modify the button
    modifyNotificationsButton()
})

sse.addEventListener('follow_request', e => {
    console.log('You have a new follow request');
    const data = e.data;
    console.log(data)
    // modify the button
    modifyNotificationsButton()
})

// add the event listener for a message notification
sse.addEventListener('message', e => {
    console.log(`We received a message`);
    const data = JSON.parse(e.data);
    console.log(data);
    modifyNotificationsButton();
})


/**
 * Extracts the amount of notifications from the string 'Show X Notifications'
 * @param {String} amount The string
 * @returns {string}
 */
function extractAndIncrementAmountOfNotificationsOneParameter(amount) {
    const separatedArray = amount.split(' ');
    const n = parseInt(separatedArray[1]) + 1;
    return `Show ${n.toString()} Notifications`
}

/**
 * Modifies the Content of the #show-notifications-button to show the newly added notifications
 */
function modifyNotificationsButton() {
    const notificationsButton = document.querySelector('#show-notifications-button');
    notificationsButton.style.visibility ='visible';
    const currentNotifications = notificationsButton.textContent;
    if (currentNotifications === '') {
        // its the empty string
        notificationsButton.textContent = 'Show 1 Notifications'
    } else {
        // there are some notifications
        notificationsButton.textContent = extractAndIncrementAmountOfNotificationsOneParameter(currentNotifications);
    }
} // here ends the function