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
            const data = await response.json();
            const messages = data.messages;
            console.log(messages);
            const messageFrom = document.querySelector('#messageFrom')
            messageFrom.textContent = userId;
            // message to
            document.querySelector('#messageTo').textContent = chat.partnerUserId;
            // chat with
            document.querySelector('#chat-with').textContent = `Chat with: ${chat.partnerUsername}`;
            document.querySelector('#chat-with').style.visibility = 'visible';
            // chatId
            document.querySelector('#chatId').textContent = chat.chatId;
        })
        li.append(div);
        activeChatsList.append(li);
    } // end of for loop
} // end of fetchChats function