// get the button that submits the form
const buttonToSubmit = document.querySelector('#post-story-button');

// prevent the default action
buttonToSubmit.addEventListener('click', evt => {
    evt.preventDefault();
    // get the input for the files
    const inputTagForFiles = document.querySelector('#filesForStory');
    const files = inputTagForFiles.files; // files array
    // amount of data to be transferred in a single HTTP request
    const CHUNK_SIZE = 1000; // 1k Bytes
    const fileReaders = [];
    // loop through the array
    for (let i = 0; i < files.length; i++) {
        // create a fileReader
        const fileReader = new FileReader();
        // set some events
        fileReader.addEventListener('load', async e => {
            // the file finished loading
            console.log(`Just finished with file with id ${i}`);
            console.log(`finished reading ${files[i].name}`)
            console.log(`we read ${files[i].size} bytes`);
            console.log(`The array buffer is of size: ${fileReader.result.byteLength}`);
            // upload it to the server
            const amountOfChunks = fileReader.result.byteLength/CHUNK_SIZE;
            // generate a unique id for the file
            const fileName = `${new Date().getTime()}-${Math.random() * 1000}-${files[i].name}`;
            // loop through all the chunks
            for (let j = 0; j <= amountOfChunks; j++) {
                const dataToTransfer = fileReader.result.slice(j * CHUNK_SIZE, CHUNK_SIZE * (j+1));
                // create the http request
                const response = await fetch(`http://localhost:3000/uploadStory?_csrf=${document.querySelector('#csrf_story').value}`, {
                    'method': 'POST',
                    'headers': {
                        "Content-Type": 'application/octet-stream',
                        "Content-Length": dataToTransfer.byteLength,
                        "File-Name": fileName
                    },
                    'body': dataToTransfer
                });
                console.log(response);
            } // here ends for loop for the chunks


        })
        // save the file reader
        fileReaders.push(fileReader);
        // start reading the file as an array buffer (basically an array of bytes)
        fileReader.readAsArrayBuffer(files[i]);
    } // end of for loop
})