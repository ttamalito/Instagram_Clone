// get the form
const form = document.querySelector('#search-form');

// add an event listener
form.addEventListener('submit', async e =>
    {
        // prevent default behaviour
        e.preventDefault();
        // get the data from the form
        const dataToSend = new URLSearchParams();
        const formData = new FormData(form);
        let urlString = '?';

        // populate the dataToSend
        for (const pair of formData) {
            urlString += pair[0];
            urlString += '=';
            urlString += pair[1];
        }
        console.log(urlString);
        // send the request
        const response = await fetch(`http://localhost:3000/search/searchUser${urlString}`,
            {
                method: 'GET',
                redirect: 'follow'
            }); // here ends fetch
        // check if redirected is needed
        if (response.redirected) {
            window.location.href = response.url;
        }
        // retrieve the data
        const data = await response.json();

        // check if there is data
        if (data.user) {
            // now create an achor tag
            const anchor = document.createElement('a');
            anchor.href = `/user/${data.user}`;
            anchor.textContent = data.user;
            const searchResult = document.querySelector('#search-result');
            // remove the children first
            removeAllChildNodes(searchResult);
            searchResult.append(anchor);
        }
        // clean the form ???
    } // here ends callback for eventListener
); // here ends evnetListener





/**
 * Fuction to remove all children of an HTML element
 * @param parent
 */
function removeAllChildNodes(parent) {
    while (parent.firstChild) {
        parent.removeChild(parent.firstChild);
    }
}