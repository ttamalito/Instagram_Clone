const activeChatsList = document.querySelector('#active-chats');

const userId = document.querySelector('#web-socket-connection-userId').value;

fetchActiveChats(userId).then().catch()

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

    for (const chat of chats) {
        const p = document.createElement('p');
        p.textContent = 'Chat id' + chat._id;
        const users = document.createElement('p');
        users.textContent = `Consisiting of ${chat.users[0]} and ${chat.users[1]}`;
        const div = document.createElement('div');
        div.append(p);
        div.append(users);
        const li = document.createElement('li');
        li.append(div);
        activeChatsList.append(li);
    } // end of for loop
} // end of fetchChats function