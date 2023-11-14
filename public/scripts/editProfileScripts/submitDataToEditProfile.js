const submitButton = document.querySelector('#csrf')
const submitForm = document.querySelector('#edit-form');
console.log(submitButton)
// add an event listener of submit
submitForm.addEventListener('submit',  async (e) => {
    // prevent the default behaviour of submitting the data
    e.preventDefault();
    // get the form
    const formData = new FormData(submitForm);
    const urlData = new URLSearchParams();
    for (const pair of formData) {
        urlData.append(pair[0], pair[1]);
    }
    const usernameButton = document.querySelector('#username');
    const response = await fetch(`http://localhost:3000/user/edit/${usernameButton.value}?_csrf=${submitButton.value}`,
        {
            method: 'POST',
            redirect: 'follow',
            body: formData //content-type is set to: multipart/form-data automatically
        }) // here ends the fetch
    console.log(response);
    if (response.redirected) {
        window.location.href = response.url; // follow the redirect
    }
});