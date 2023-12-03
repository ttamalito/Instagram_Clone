// get the button
const webSocketButton = document.querySelector('#web-socket-connection-userId');

// get the list that has all the chats

// establish the websocket connection
const ws = new WebSocket(`ws://localhost:3000/${webSocketButton.value}`);

ws.onopen = e => console.log(`WebSocket connection open`);
ws.onmessage = m => {
    console.log(m)
}

const sendData = document.querySelector('#send-test-message');
sendData.addEventListener('click', e => {
    const message = createMessage(webSocketButton.value, 'whatEver', 'the chatId',
        'This is a test message from the client')
    ws.send(message);
})


// get the form
const chatForm = document.querySelector('#chat-form')

// add the event listener
chatForm.addEventListener('submit', e => {
    e.preventDefault();
    const messageToBeSent = prepareMessage();
    // reset the form
    chatForm.reset();
    // send the message through the websocket
    ws.send(messageToBeSent);
})


/**
 * Prepares the message to be sent.
 * @return {String} The JSON object as a String
 */
function prepareMessage() {
    const messageTo = document.querySelector('#messageTo').textContent;
    const messageFrom = document.querySelector('#messageFrom').textContent;
    const chatId = document.querySelector('#chatId').textContent;
    const content = new FormData(chatForm).get('message');

    // create the object
    return createMessage(messageFrom, messageTo, chatId, content);
}

/**
 * Creates a message object to be sent as a JSON string
 * @param {String} messageFrom
 * @param {String} messageTo
 * @param {String} chatId
 * @param {String} content
 * @returns {String} the object as a String, in JSON format
 */
function createMessage(messageFrom, messageTo, chatId, content) {
    const obj =  {
        messageFrom: messageFrom,
        messageTo: messageTo,
        chatId: chatId,
        content: content,
        date: new Date().toISOString()
    }

    return JSON.stringify(obj);

} // here ends the function
