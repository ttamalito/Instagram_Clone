const buttonLike = document.querySelector('#button-like');

buttonLike.addEventListener('click', e => {
    // fetch the api
    fetch(`http://localhost:3000/like/${buttonLike.value}`, {
        method: 'GET',
        redirect: "follow"
    }).then( (res) => {
        console.log(res)
        if (res.redirected) {
            // redirect if true
            window.location.href = res.url;
        }

    }).catch((error) => {console.error(error)});
} ) // here ends the EventListener