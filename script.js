/* eslint-env es6 */

const wrapper = document.querySelector("#wrapper");
const cardText = document.querySelector(".card-text");
const btnCall = document.querySelector(".btn");
const cardBox = document.querySelector(".card");
const referenceDiv = document.querySelector(".card-body");

const showCardDiv = document.createElement("div");
const cardImage = document.createElement("img");

const card1 = document.querySelector("#card-1");
const card2 = document.querySelector("#card-2");
const card3 = document.querySelector("#card-3");

const MIN_CARDS = 0;
const MAX_CARDS = 77;



let pickedCards = [];

btnCall.addEventListener('click', () => 
{
    // let randomResult = 0;
    pullCard();
    setTimeout(() => document.getElementById("card-1").innerHTML = "<img src='images/"+pickedCards[0]+".png' class='card-img-top' alt='card text'>", 2500);
    setTimeout(() => document.getElementById("card-2").innerHTML = "<img src='images/"+pickedCards[1]+".png' class='card-img-top' alt='card text'>", 3500);
    setTimeout(() => document.getElementById("card-3").innerHTML = "<img src='images/"+pickedCards[2]+".png' class='card-img-top' alt='card text'>", 4500);

    setTimeout(() => document.getElementById("change-btn").innerHTML = "<button type=\"button\" onClick=\"window.location.reload();\" class=\"btn btn-info btn-lg btn-block\">New Reading</button>", 4500);
});


function pullCard() 
{

    let cardNumber = getRandomArbitrary(MIN_CARDS, MAX_CARDS);
}

function getRandomArbitrary(min, max) 
{
    while (pickedCards.length < 3) 
    {
        result = Math.floor(Math.random() * (max - min) + min);

        if (pickedCards.indexOf(result) == -1) 
        {
            pickedCards.push(result);
        }
    }
}

