let leaveComments = document.querySelectorAll('.leave-comment');

// add an event listener to every leaveComent button, to make it visible
for (const leaveComment of leaveComments) {
    leaveComment.addEventListener('click', e => {
        // display the create-comment div
        const createComment = document.querySelector(`#create-comment-${leaveComment.value}`);
        createComment.style.visibility = 'visible';
    })
} // here ends the for loop

// create a fetch for create comment
let postComments = document.getElementsByClassName('post-comment');

// add an event listener ot every single button
for (const postComment of postComments) {
    postComment.addEventListener('click', e => {
        const comment = document.querySelector(`#comment-${postComment.value}`).value;
        const form = document.querySelector(`#form-${postComment.value}`);

        const data = new URLSearchParams();
        for (const pair of new FormData(form)) {
            data.append(pair[0], pair[1]);
        }

        fetch(`http://localhost:3000/post/comment/${postComment.value}`, {
            method: 'POST',
            redirect: 'follow',
            body: data
        }).then(res => {
            if (res.redirected) {
                // redirect if true
                window.location.href = res.url;
            }

        }).catch((error) => {console.error(error)});
    }) // here ends the event listener
} // here ends the for loop



// code to display the comments
let seeComments = document.getElementsByClassName('see-comments');
// for each seeComments button add an event listener
for (const seeComment of seeComments) {
    seeComment.addEventListener('click', async e => {
        const comment = document.querySelector(`#comments-${seeComment.value}`);
        comment.style.visibility = 'visible';
        let data = await fetch(`http://localhost:3000/post/comment/${seeComment.value}`, {
            method: 'GET',
            redirect: 'follow'
        })
        data.json().then( (d) => {
            // here we have the data
            const ul = document.querySelector(`#list-${seeComment.value}`);
            for (const comment of d) {
                let li = document.createElement('li');
                ul.append(`${comment.comment} by ${comment.user}`, li);
            }
        } ).catch( (error) => {console.log(error)} )
    })
}
// this is to display the comments


let likesButtons = document.getElementsByClassName('likedBy');

// add am event listener to avery single class
for (const button of likesButtons) {
    button.addEventListener('click', async e => {
        // display the div
        const likes = document.querySelector(`#likes-${button.value}`);
        console.log(likes)
        likes.style.visibility = 'visible';

        // fetch the data
        let response;
        try {
            response = await fetch(`http://localhost:3000/post/liked/${button.value}`, {
                method: 'GET',
                redirect: 'follow'
            });
        }catch (error) {
            console.error(error);
        } // here ends try catch block
        const data = await response.json();
        console.log(data)
        // now iterate through the data and display it
        for (const user of data) {
            let li = document.createElement('li');
            const ul = document.querySelector(`#likes-list-${button.value}`);
            ul.append(`${user.username}`, li);
        }
    })
} // here ends the for loop