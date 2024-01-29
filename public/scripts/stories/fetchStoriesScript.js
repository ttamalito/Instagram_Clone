// image
const storyImage = document.querySelector('#story-image');
// video element
const storyVideo = document.querySelector('#story-video');

// story owner
const ownerUsername = document.querySelector('#story-owner-username').value;

// story filename
const filename = document.querySelector('#story-filename').value;

// story sequence number
const sequenceNumber = document.querySelector('#story-sequence-number').value;

// fetch the data
fetch(`http://localhost:3000/stories/${ownerUsername}/${filename}/${sequenceNumber}`, {
    method: "GET",
    redirect: "follow"
}).then(res => {
    console.log(res.type)
    // get the content-type
    const contentType = res.headers.get('content-type');
    console.log(`Content-Type: ${contentType}`);
    res.arrayBuffer().then(arr => {
        console.log(`we have an array buffer`);
        console.log(arr)
        // convert the array to base64
        const base64 = btoa(
            new Uint8Array(arr)
                .reduce((data, byte) => data + String.fromCharCode(byte), '')
        );
        // add the byte array as an image
        storyImage.src = `data:${contentType};base64,${base64}`;
    })
})