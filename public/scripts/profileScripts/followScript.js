const followUserButton = document.querySelector('#follow-user');
const csrfTokenButton = document.querySelector('#csrf');
const removeRequestToFollowButton = document.querySelector('#remove-request-to-follow');
// add an avent listener to send a post request when clicking
if (followUserButton) {
    // it is not null
    followUserButton.addEventListener('click', async e => {
        // make the request
        const response = await fetch(`http://localhost:3000/user/follow/${followUserButton.value}?_csrf=${csrfTokenButton.value}`, {
            method: 'POST',
            redirect: 'follow',

        });
        console.log(response)
        if (response.redirected) {
            window.location.href = response.url;
        }
    }); // add an event listener

}


// check if not null
if (removeRequestToFollowButton) {
    // add an event listener
    removeRequestToFollowButton.addEventListener('click', async e => {
        // make the request
        const response = await fetch(`http://localhost:3000/user/removeRequestToFollow/${removeRequestToFollowButton.value}`, {
            method: 'GET',
            redirect: 'follow',

        });
        if (response.redirected) {
            window.location.href = response.url;
        }


    }); // add an event listener
}