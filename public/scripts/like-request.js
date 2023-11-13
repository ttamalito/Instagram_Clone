

let buttonsToLike = document.getElementsByClassName('button-like');
console.log(buttonsToLike)
// add am event listener to avery single class
for (const button of buttonsToLike) {
    button.addEventListener('click', async e => {
        // fetch the api
        fetch(`http://localhost:3000/like/${button.value}`, {
            method: 'GET',
            redirect: "follow"
        }).then( (res) => {
            console.log(res)
            if (res.redirected) {
                // redirect if true
                window.location.href = res.url;
            }

        }).catch((error) => {console.error(error)});
    })
} // here ends the for loop