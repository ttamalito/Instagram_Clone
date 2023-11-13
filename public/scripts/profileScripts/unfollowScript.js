const unfollowButton = document.querySelector('#unfollow-user');
const csrfTokenButtong = document.querySelector('#csrf');


// add event listener to send a request to unfollow the user
unfollowButton.addEventListener('click', async e => {
    const response = await fetch(`http://localhost:3000/user/unfollow/${unfollowButton.value}?_csrf=${csrfTokenButtong.value}`, {
        method: 'POST',
        redirect: 'follow'
    })
    if (response.redirected) {
        // redirect
        window.location.href = response.url;
    }
}) // here ends the callback for the evenet listener) // here ends the event listener