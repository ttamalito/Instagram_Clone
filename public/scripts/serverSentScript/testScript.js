
const sse = new EventSource('http://localhost:3000/open-connection');
sse.onmessage = console.log;
sse.onopen = () => {console.log(`we have opened the connection`)};

sse.addEventListener('error', () => {
    // on error, do not retry
    sse.close();
    console.log('Close Connection from the client side because of an error or connection could not be established');
})

// add a testing event listener
sse.addEventListener('testing', (e) => {
    console.log('We got a testing event');
    const data = e.data;
    const parsedData = JSON.parse(data);
    console.log(data);
    console.log(parsedData.marica);
    console.log(parsedData.hello);

})


// event to receive a like
sse.addEventListener('like', e => {
    console.log('You received a like!');
    const data = e.data;
    console.log(data);
})
