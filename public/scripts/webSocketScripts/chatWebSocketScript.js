/*
Main script to handle the sending and receiving of chats
 */


// get the button that has the user id
const webSocketButton = document.querySelector('#web-socket-connection-userId');


// establish the websocket connection for a given user
const ws = new WebSocket(`ws://localhost:3000/${webSocketButton.value}`);

ws.onopen = e => console.log(`WebSocket connection open`);
ws.onmessage = m => {
    console.log(m)
    const message  = JSON.parse(m.data);
    receiveMessage(message);
}

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
 * That is, it creates a JSON object with the relevant data of
 * the message to be sent.
 * It prints the message in the screen, so that the user can see it
 * @return {String} The JSON object as a String
 */
function prepareMessage() {
    const messageTo = document.querySelector('#messageTo').textContent;
    const messageFrom = document.querySelector('#messageFrom').textContent;
    const chatId = document.querySelector('#chatId').textContent;
    const content = new FormData(chatForm).get('message');

    // print the message to the screen
    const listOfMessages = document.querySelector('#conversation-messages');
    const messageDiv = document.createElement('div');
    messageDiv.textContent = content;
    const li = document.createElement('li');
    li.append(messageDiv);
    listOfMessages.append(li);

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

/**
 * Prints the newly received message to the screen if the message
 * belongs to the chat in the main chat tab.
 * Otherwise it will increase the pending messages amount for the given chat.
 * @param message
 */
function receiveMessage(message) {
    // this is what the message object looks like
    /*
messageFrom: String – id of the user
messageTo: String – id of the user
chatId: String – Id of the chat
content: String – content of the message
 */


    // first get the chat id
    const chatId = message.chatId;
    // now check if the chatId is the main chat
    const mainChatId = document.querySelector('#chatId').textContent;
    if (chatId !== mainChatId) {
        // they are not the same,
        // that is the user received a chat from someone who is not the main chat
        const pendingMessagesElement = document.querySelector(`#pendingMessages-${chatId}`);
        const pendingMessagesAmount = pendingMessagesElement.textContent;
        if (pendingMessagesAmount === '') {
            // no pending messages
            pendingMessagesElement.textContent = '1';
        } else {
            // there is an amount
            let amountOfMessages = parseInt(pendingMessagesAmount);
            amountOfMessages++;
            pendingMessagesElement.textContent = `${amountOfMessages}`
        }
    } // here ends if the received message is not from the main chat

    // the message is from the main chat
    // add it to the list
    const listOfMessages = document.querySelector('#conversation-messages');
    const messageDiv = document.createElement('div');
    messageDiv.textContent = message.content;
    const li = document.createElement('li');
    li.append(messageDiv);
    listOfMessages.append(li);
} // here ends receiveMessage
