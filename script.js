const INITIAL_CARD_COUNT = 12;
const ROW_NUMBER = 3;
const CARD_SHOW_TIME = 800;
const TRANSITION_TIME = 1000;
const GAME_TIMER = 60000;
const SHOW_CARD = 'show';
const HIDE_CARD = 'hide';

const startBtn = document.querySelector('#start');

let numOfCards = INITIAL_CARD_COUNT;
let cardOne = null; 
let cardTwo = null;
let score = 0;

// Render Cards
function createCards(cardCount) {
    const container = document.querySelector('.container');
    for (let i = 0; i < ROW_NUMBER; i++) {
        const row = document.createElement('div')
        row.className = 'row';
        const columnCount = cardCount / ROW_NUMBER;
        createCardColumn(row, columnCount);
        container.appendChild(row);
    }
    addCardValues(cardCount);
}

function createCardColumn(rowDiv, columnCount) {
    for (let i = 0; i < columnCount; i++) {
        const card = document.createElement('div');
        card.className = 'card';
        const cardValue = document.createElement('div');
        cardValue.className = 'cardValue';
        card.appendChild(cardValue);
        rowDiv.appendChild(card);
    }
}

// Create and insert values to cards
function addCardValues(cardCount) {
    const arrayOfPairs = createValues(cardCount);
    let currentIndex = 0;
    const cardValues = document.querySelectorAll('.cardValue');
    cardValues.forEach( (card) => {
        card.textContent = arrayOfPairs[currentIndex];
        currentIndex += 1;
    });
}

function createValues(cardCount) {
    const numOfPairs = cardCount / 2;
    const arrayOfPairs = [];
    for (let i = 0; i < numOfPairs; i++) {
        arrayOfPairs.push(i)
        arrayOfPairs.push(i)
    }

    return arrayOfPairs.sort(() => .5 - Math.random());
}

// Toggle cards
function listenToClicks() {
    const cardContainer = document.querySelectorAll('.card')
    cardContainer.forEach( (card) => {
        card.addEventListener('click', toggleCard)
    })
}

function toggleCard(event) {
    if (!cardOne || !cardTwo) {
        const card = this.firstElementChild;
        if (!card.classList.contains('displayCard')) {
            card.classList.toggle('displayCard');
            saveCard(card);
        }
    }
}

// Game logic
const REVEAL_TIME = 1000;

function startGame(cardCount) {
    // display card for a short time
    toggleAllCards(SHOW_CARD);
    setTimeout(() => {
        toggleAllCards(HIDE_CARD);
    }, REVEAL_TIME);
    setTimeout(() => {
        addCardValues(cardCount);
        listenToClicks();
    }, REVEAL_TIME + TRANSITION_TIME);
    gameTimer();
}


function saveCard(card) {
    if (cardOne === null) {
        cardOne = card;
    } else {
        cardTwo = card;
        checkMatch();
    }
}

function checkMatch() {
    if (cardOne && cardTwo) {
        if (cardOne.textContent === cardTwo.textContent) {
            removeClickEvents();
            setCardsNull();
            addPoint();
            setTimeout(checkScore, TRANSITION_TIME);
        } else {
            setTimeout(() => {
                closeCards();
                setCardsNull();
            }, CARD_SHOW_TIME)
        }
    }
}

function closeCards() {
    cardOne.classList.toggle('displayCard');
    cardTwo.classList.toggle('displayCard');
}

function setCardsNull() {
    cardOne = null;
    cardTwo = null;
}

function removeClickEvents() {
    cardOne.parentNode.removeEventListener('click', toggleCard);
    cardTwo.parentNode.removeEventListener('click', toggleCard);
}

function toggleAllCards(cardFace) {
    const cardValues = document.querySelectorAll('.cardValue');
    cardValues.forEach( (card) => {
        const cardShown = card.classList.contains('displayCard');
        if (cardFace === SHOW_CARD) {
            if (!cardShown) {
                card.classList.toggle('displayCard')
            }
        } else {
            if (cardShown) {
                card.classList.toggle('displayCard')
            }
        }
    });
}

function listenToGameButtons() {    
    startBtn.addEventListener('click', 
        () => startGame(numOfCards),
        {once: true}
    );
}

function addPoint() {
    score += 1;
}

function checkScore() {
    if (score === numOfCards / 2) {
        alert('You won!');
    }
}

function gameTimer() {
    setTimeout(endGame , GAME_TIMER);
}

function endGame() {
    if (score < numOfCards / 2) {
        toggleAllCards(SHOW_CARD);
        alert(`You didn't find all the cards`)
    } else {
        alert('You won!')
    }
}

createCards(numOfCards);
listenToGameButtons();