
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
    console.log('You received a like!');
    // console.log(data);
    // update the counter of notifications
    const notificationsButton = document.querySelector('#show-notifications-button');
    console.log(notificationsButton.textContent);
    notificationsButton.style.visibility ='visible';
    const currentNotifications = notificationsButton.textContent;
    if (currentNotifications === '') {
        // its the empty string
        notificationsButton.textContent = 'Show 1 Notifications'
    } else {
        // there are some notifications
        notificationsButton.textContent = extractAndIncrementAmountOfNotificationsOneParameter(currentNotifications);
    }
    // make the notifications div visible
    // const notificationsDiv = document.querySelector('#notifications-div');
    // notificationsDiv.style.visibility = 'visible';
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
