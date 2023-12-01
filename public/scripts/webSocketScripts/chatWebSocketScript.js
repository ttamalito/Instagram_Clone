// get the button
const webSocketButton = document.querySelector('#web-socket-connection-username');

// get the list that has all the chats

// establish the websocket connection
const ws = new WebSocket(`ws://localhost:3000/${webSocketButton.value}`);

ws.onopen = e => console.log(`WebSocket connection open`);
ws.onmessage = m => {
    console.log(m)
}

const sendData = document.querySelector('#send-test-message');
sendData.addEventListener('click', e => {
    ws.send('Hello from the client');
})
