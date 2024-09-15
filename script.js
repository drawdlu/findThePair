const INITIAL_CARD_COUNT = 12;
const ROW_NUMBER = 3;

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
    const card = this.firstElementChild.classList;
    card.toggle('displayCard')
}

// Game logic
let cardOne; 
let cardTwo;
const REVEAL_TIME = 1000;

function startGame(cardCount) {
    // display card for a short time
    toggleAllCards();
    setTimeout(toggleAllCards, REVEAL_TIME);
    setTimeout(() => {
        addCardValues(cardCount)
    }, REVEAL_TIME);

    listenToClicks();
}

function toggleAllCards() {
    const cardValues = document.querySelectorAll('.cardValue');
    cardValues.forEach( (card) => {
        card.classList.toggle('displayCard')
    });
}

createCards(INITIAL_CARD_COUNT);

const startBtn = document.querySelector('#start');
startBtn.addEventListener('click', () => startGame(INITIAL_CARD_COUNT));