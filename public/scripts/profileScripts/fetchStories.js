// button to display stories
const storiesButton = document.querySelector('#stories-button-profile');
// check if it is not null, so that the script should fetch the stories of the user
if (storiesButton) {
    // fetch the stories
    fetch(`http://localhost:3000/getStories/${storiesButton.value}`,{
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
            // put the correct link in the anchor tag
            const anchor = document.querySelector('#stories-anchor-profile');
            anchor.href = anchor.href + data.stories[0].filename + '/0';
            anchor.style.visibility = 'visible';
            anchor.textContent = 'View Stories';

        }
    }).catch(err => console.error(err)) // end of fetch
} // end of if storiesButton is defined