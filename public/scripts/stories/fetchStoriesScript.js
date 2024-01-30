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
fetch(`http://localhost:3000/fetchStories/${ownerUsername}/${filename}/${sequenceNumber}`, {
    method: "GET",
    redirect: "follow"
}).then(res => {
    console.log(res.type)
    // get the content-type
    const contentType = res.headers.get('content-type');
    console.log(`Content-Type: ${contentType}`);
    // check if it is an image or video
    if (contentType[0] === 'i') {
        // it is an image
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
            storyImage.style.visibility = 'visible';
            moreStories();
        })
    }  else {
        console.log(`It is a video!`);
        // it is a video
        storyVideo.src = `http://localhost:3000/fetchStories/${ownerUsername}/${filename}/${sequenceNumber}`;
        storyVideo.style.visibility = 'visible';
        moreStories();
    }
})


function moreStories() {
    fetch(`http://localhost:3000/getMoreStories/${ownerUsername}`,{
        method: 'GET',
        redirect: 'follow'
    }).then(async response => {
        // check if redirected is needed
        if (response.redirected)
            window.location.href = response.url;
        // else get the data
        const data = await response.json();
        console.log(data);
        // the data is an array
        if (data.stories.length > 0) {
            // there are some stories
            // check the current sequence number against the stories.length
            const maxStories = data.stories.length -1;
            if (maxStories > Number(sequenceNumber)) {
                // there are some stories left
                const nextStoryAnchor = document.querySelector('#next-story-anchor');
                nextStoryAnchor.style.visibility = 'visible';
                // get the next sequence number
                const nextIndex = Number(sequenceNumber) + 1;
                // new file name
                const nextFile = data.stories[nextIndex].filename;
                nextStoryAnchor.href = `http://localhost:3000/stories/${ownerUsername}/${nextFile}/${nextIndex}`
            }
        }
    }).catch(err => console.error(err)) // end of fetch
}