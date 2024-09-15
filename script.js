const INITIAL_CARD_COUNT = 9;
const ROW_NUMBER = 3;

function createCards(cardCount) {
    const container = document.querySelector('.container');
    for (let i = 0; i < ROW_NUMBER; i++) {
        const row = document.createElement('div')
        row.className = 'row';
        const columnCount = cardCount / ROW_NUMBER;
        createCardColumn(row, columnCount);
        container.appendChild(row);
    }
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

createCards(INITIAL_CARD_COUNT);