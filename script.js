const INITIAL_CARD_COUNT = 12;
const ROW_NUMBER = 3;
const CARD_SHOW_TIME = 800;
const TRANSITION_TIME = 1000;
const GAME_TIMER = 30000;
const SHOW_CARD = 'show';
const HIDE_CARD = 'hide';
const BAR_SHRINK_TIME = 105;

let gameInSession = false;
let gameInitialStart = false;
let numOfCards = INITIAL_CARD_COUNT;
let cardOne = null; 
let cardTwo = null;
let cardOneDigit = null;
let cardTwoDigit = null;
let score = 0;
let round = 0;

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
        // remove previous images
        (Array.from(card.children)).forEach ( (child) => child.remove());

        const cardImage = document.createElement('img');
        cardImage.src = "assets/cards/" + arrayOfPairs[currentIndex] + ".png";
        card.appendChild(cardImage);
        currentIndex += 1;
    });
}

function createValues(cardCount) {
    const numOfPairs = cardCount / 2;
    const arrayOfPairs = [];
    for (let i = 1; i <= numOfPairs; i++) {
        arrayOfPairs.push(i)
        arrayOfPairs.push(i)
    }

    return arrayOfPairs.sort(() => .5 - Math.random());
}

// Toggle cards
function listenToCardClicks() {
    const cardContainer = document.querySelectorAll('.card')
    cardContainer.forEach( (card) => {
        card.addEventListener('click', toggleCard)
    })
}

const selectAudio = new Audio("assets/sounds/select.wav");
function toggleCard(event) {
    if (gameInSession) {
        if (!cardOne || !cardTwo) {
            const card = this.firstElementChild;
            if (!card.classList.contains('displayCard')) {
                card.classList.toggle('displayCard');
                selectAudio.currentTime = 0;
                selectAudio.play();
                saveCard(card);

                // TEST
                gameWon();
            }
        }
    }
}

// Game logic
const REVEAL_TIME = 1000;

const overlay = document.querySelector('.overlay');

function startGame(cardCount) {
    // remove overlay from display
    removeOverlay();

    // display card for a short time
    setTimeout( () => {
        overlay.classList.toggle('zeroHeight');
        toggleAllCards(SHOW_CARD);
        setTimeout(() => {
            toggleAllCards(HIDE_CARD);
        }, REVEAL_TIME);
    
    }, TRANSITION_TIME)

    setTimeout(() => {
        addCardValues(cardCount);
        listenToCardClicks();
        gameTimer(GAME_TIMER);
        updateBar();
        gameInSession = true;
        gameInitialStart = true;
    }, REVEAL_TIME + TRANSITION_TIME * 2);
}

function removeOverlay() {
    const overlayText = document.querySelector('.overlayText');
    overlay.classList.add('hideOverlay');
    overlayText.style.display = 'none';
}


function saveCard(card) {
    // extract number from filename
    let reg = /\/(..?)\.png/; 
    let num = reg.exec(card.firstElementChild.src)[1];

    if (cardOne === null) {
        cardOne = card;
        cardOneDigit = num;
    } else {
        cardTwo = card;
        cardTwoDigit = num;
        checkMatch();
    }
}

function checkMatch() {
    if (cardOne && cardTwo) {
        if (cardOneDigit === cardTwoDigit) {
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

const startBtn = document.querySelector('#start');
const pauseBtn = document.querySelector('#pause');

function listenToGameButtons() {    
    startBtn.addEventListener('click', 
        () => startGame(numOfCards),
        {once: true}
    );

    pauseBtn.addEventListener('click', pauseGame);
}

let timePaused;
let gameRunningTime = 0; 
function pauseGame() {
    if (gameInitialStart) {
        if (gameInSession) {
            clearInterval(intervalBar);
            clearTimeout(currGameTime);
            timePaused = (new Date()).getTime();
            gameRunningTime = gameRunningTime + (timePaused - timeAtStart);
            toggleOverlay();
        } else {
            gameTimer(GAME_TIMER - gameRunningTime);
            updateBar();
            toggleOverlay ();
        }
        gameInSession = !gameInSession;
    }
}

const gameWindow = document.querySelector('.overlay');
function toggleOverlay() {

    gameWindow.classList.toggle('hideOverlay');
    gameWindow.classList.toggle('overlayPause');
    gameWindow.classList.toggle('zeroHeight');
}

function addPoint() {
    score += 1;
}

function checkScore() {
    if (score === numOfCards / 2) {
        gameWon();
    }
}


const winningSound = new Audio("assets/sounds/winRound.wav");
function gameWon() {
    winningSound.play();
    gameInSession = false;
    clearInterval(intervalBar);
    clearTimeout(currGameTime);
    pauseBtn.removeEventListener('click', pauseGame);
    const winText = document.querySelector('.alertText.win');
    showMessage(winText);
    gameWindow.classList.toggle('zeroHeight');
}

let intervalBar;
let currGameTime; 
let timeAtStart;
function gameTimer(time) {
    timeAtStart = (new Date()).getTime();
    currGameTime = setTimeout(endGame , time);
}

function updateBar() {
    const remPercent = getPercentToSubtract();
    intervalBar = setInterval( () => {
        updateGameBar(remPercent)
        }, BAR_SHRINK_TIME);
}

function getPercentToSubtract() {
    return (INITIAL_WIDTH.slice(0, -2) / (GAME_TIMER / BAR_SHRINK_TIME))
}


const loseGameSound = new Audio("assets/sounds/gameOver.wav");
function endGame() {
    gameInSession = false;
    pauseBtn.removeEventListener('click', pauseGame);
    if (score < numOfCards / 2) {
        toggleAllCards(SHOW_CARD);
        loseGameSound.play();
        clearInterval(intervalBar);
        const loseText = document.querySelector('.alertText.lose');
        showMessage(loseText);
        gameWindow.classList.toggle('zeroHeight');
    }
}

function showMessage(text) {
    text.classList.toggle('alertFlex');
    overlay.removeAttribute('style');
    overlay.classList.remove('hideOverlay');
}

const bar = document.querySelector('.timeBar');
const INITIAL_WIDTH = window.getComputedStyle(bar).width;
let width = INITIAL_WIDTH;

function updateGameBar(numToRemove) {
    if (gameInSession) {
        width = ((width.slice(0, -2)) - numToRemove).toFixed(1) + 'px';
        bar.style.width = width;
    }
}

function checkWindowClose() {
    window.addEventListener('beforeunload', (event) => {
        if (gameInSession) {
            pauseGame();
            event.preventDefault();
            return "Are you sure?";
        }
    });
}

// Pause when changing tabs
window.addEventListener('blur', () => {
    if (gameInSession) {
        pauseGame();
    }
});

createCards(numOfCards);
listenToGameButtons();
checkWindowClose();