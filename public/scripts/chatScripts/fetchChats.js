const activeChatsList = document.querySelector('#active-chats');

const userId = document.querySelector('#web-socket-connection-userId').value;

fetchActiveChats(userId).then().catch()

/**
 * Only fetches the active chats of the user, no messages. nothing else
 * @param {String} userId
 * @return {Promise<void>}
 */
async function fetchActiveChats(userId) {
    const response = await fetch(`http://localhost:3000/chat/retrieveChats/${userId}`, {
        method: 'GET',
        redirect: "follow"
    })
    // check if we need to redirect
    if (response.redirected) {
        window.location.href = response.url;
    }

    // else get the data
    const data = await response.json();
    const chats = data.chats;
    /*
    This is how each chat object looks like
    {
                 chatId: String
                 userId: String, (The user that is visiting the page
                partnerUsername: String,
                partnerUserId: String,
     */
    for (const chat of chats) {
        const p = document.createElement('p');
        p.textContent = 'Chat id ' + chat.chatId;
        const users = document.createElement('p');
        users.textContent = `Chat with ${chat.partnerUsername}`;
        const div = document.createElement('div');
        div.append(p);
        div.append(users);
        // Space to show how many unread messages you have in the following chat
        const pendingMessages = document.createElement('span');
        pendingMessages.id = `pendingMessages-${chat.chatId}`;
        // add it to the div
        div.append(pendingMessages);
        const li = document.createElement('li');

        // add an event listener, to fetch the messages of a given chat
        li.addEventListener('click', async e => {
            const response = await fetch(`http://localhost:3000/chat/getChatMessages/${chat.chatId}`, {
                method: 'GET',
                redirect: 'follow'
            })
            // check if redirected is needed
            if (response.redirected)
                window.location.href = response.url

            const messageFrom = document.querySelector('#messageFrom')
            messageFrom.textContent = userId;
            // message to
            document.querySelector('#messageTo').textContent = chat.partnerUserId;
            // chat with
            document.querySelector('#chat-with').textContent = `Chat with: ${chat.partnerUsername}`;
            document.querySelector('#chat-with').style.visibility = 'visible';
            // chatId
            document.querySelector('#chatId').textContent = chat.chatId;
            // make the pending messages equal to 0
            document.querySelector(`#pendingMessages-${chat.chatId}`).textContent = '';

            // make the form to input a message visible
            document.querySelector('#message-input').style.visibility ='visible';
            // logic to display the messages
            const data = await response.json();
            const messages = data.messages;
            // empty the list
            const conversationMessages = document.querySelector('#conversation-messages');
            removeAllChildNodes(conversationMessages);
            // display the messages
            displayFetchedMessages(messages);
        })
        li.append(div);
        activeChatsList.append(li);
    } // end of for loop
} // end of fetchChats function

/**
 * Function to display all the fetched messages according to who sent it and who received it.
 * @param {[Object]} messages
 */
function displayFetchedMessages(messages) {
    // messages is an array of objects
    // where each object is:
    /*
/**
 * @typedef {Object} Message
 * @property {ObjectId} messageFrom
 * @property {ObjectId} messageTo
 * @property {String} date
 * @property {String} content
 * @property {[ObjectId]} likes
     */
    for (const message of messages) {
        console.log(message.messageFrom)
        console.log(document.querySelector('#messageTo').textContent)
        // check if the messageFrom property matches the messageTo HTML tag
        if (message.messageFrom === document.querySelector('#messageTo').textContent) {
            // display the message as received
            const listOfMessages = document.querySelector('#conversation-messages');
            const messageDiv = document.createElement('div');
            messageDiv.textContent = message.content;
            const li = document.createElement('li');
            li.className = 'received-message';
            li.append(messageDiv);
            listOfMessages.append(li);
        } else {
            // display it as sent
            const listOfMessages = document.querySelector('#conversation-messages');
            const messageDiv = document.createElement('div');
            messageDiv.textContent = message.content;
            const li = document.createElement('li');
            li.className = 'sent-message';
            li.append(messageDiv);
            listOfMessages.append(li);
        }
    } // here ends the for loop


} // here ends displayFetchedMessages