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
    const cards = document.querySelectorAll('.cardValue');
    let currentIndex = 0;
    cards.forEach( (card) => {
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
    const cards = document.querySelectorAll('.card')
    cards.forEach( (card) => {
        card.addEventListener('click', toggleCard)
    })
}

function toggleCard(event) {
    const card = this.firstElementChild.classList;
    card.toggle('displayCard')
}

createCards(INITIAL_CARD_COUNT);
listenToClicks();