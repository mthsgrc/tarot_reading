/* eslint-env es6 */

const wrapper = document.querySelector("#wrapper");
const cardText = document.querySelector(".card-text");
const btnCall = document.querySelector(".btn");
const cardBox = document.querySelector(".card");
const showCardDiv = document.createElement("div");
const referenceDiv = document.querySelector(".card-body");



btnCall.addEventListener('click', () => {
    let randomResult = 0;
    // randomResult = setTimeout(pullCard(), 3000);
    randomResult = pullCard();

    cardBox.insertBefore(showCardDiv, referenceDiv);
    showCardDiv.innerHTML = "<img src='images/"+randomResult+".jpg' class='card-img-top' alt='card text'>";

});


function pullCard() {
  let cardNumber = getRandomArbitrary(0, 156);
  return cardNumber;
}

function getRandomArbitrary(min, max) {
    result = Math.random() * (max - min) + min;
    return result.toFixed(0);
}

function getRandomArbitrary2(min, max) {
  for (var i = 0; i < 20; i++) {
    result = Math.random() * (max - min) + min;
    console.log(result.toFixed(0));
  }
}
