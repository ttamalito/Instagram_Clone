const followUserButton = document.querySelector('#follow-user');
const csrfTokenButton = document.querySelector('#csrf');
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