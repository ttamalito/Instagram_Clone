
// logic to like a picture
let buttonsToLike = document.getElementsByClassName('button-like');
console.log(buttonsToLike)
// add am event listener to avery single class
for (const button of buttonsToLike) {
    button.addEventListener('click', async e => {


        // fetch the api
        fetch(`http://localhost:3000/like/${button.value}`, {
            method: 'GET',
            redirect: "follow"
        }).then( async (res) => {
            if (res.redirected) {
                // redirect if true
                window.location.href = res.url;
            }

            const data = await res.json();
            // update the like count
            const spanLikeCount = document.querySelector(`#like-count-${button.value}`);
            spanLikeCount.textContent = data.likeCount;

            // change the text of the Like button to Dislike or from Dislike to Like
            if (button.textContent === 'Like') {
                button.textContent = 'Dislike';
            } else {
                button.textContent = 'Like';
            }

        }).catch((error) => {console.error(error)});
    })
} // here ends the for loop