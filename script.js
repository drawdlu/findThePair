const INITIAL_CARD_COUNT = 12;
const ROW_NUMBER = 4;
const CARD_SHOW_TIME = 800;
const TRANSITION_TIME = 1000;
const GAME_TIMER = 120000;
const SHOW_CARD = 'show';
const HIDE_CARD = 'hide';
const BAR_SHRINK_TIME = 105;
const MAX_ROUNDS = 4;
const CLICK_START = 250;

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
function createCards() {
    const container = document.querySelector('.container');
    for (let i = 0; i < ROW_NUMBER; i++) {
        const row = document.createElement('div')
        row.className = 'row';
        const columnCount = numOfCards / ROW_NUMBER;
        createCardColumn(row, columnCount);
        container.appendChild(row);
    }
    addCardValues();
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
function addCardValues() {
    const arrayOfPairs = createValues(numOfCards);
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


function createValues() {
    const arrayOfPairs = [];
    const numOfPairs = numOfCards / 2;

    for (let i = 1; i <= numOfPairs; i++) {
        arrayOfPairs.push(i);
        arrayOfPairs.push(i);
    }

    return arrayOfPairs.sort(() => .5 - Math.random());
}

// Toggle cards
function listenToCardClicks() {
    const cardContainer = document.querySelectorAll('.card')
    cardContainer.forEach( (card) => {
        card.addEventListener('click', toggleCard);
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
            }
        }
    }
}

// Game logic
const REVEAL_TIME = 1000;

const overlay = document.querySelector('.overlay');
const readyStart = document.querySelector('.readyStart');

function startGame() {
    
    round += 1;
    removeOverlay();
    readyStart.classList.toggle('hideOverlay');
    readyStart.classList.toggle('zeroHeight');

    // display cards for a short time
    setTimeout(() => {
        toggleAllCards(SHOW_CARD);
    }, TRANSITION_TIME);

    setTimeout(() => {
        toggleAllCards(HIDE_CARD);
    }, TRANSITION_TIME + REVEAL_TIME);

    // start game
    setTimeout(() => {
        toggleReadyStartText();
        readyStart.classList.toggle('hideOverlay');
        listenToCardClicks();
        gameTimer(GAME_TIMER);
        updateBar();
        gameInSession = true;
        gameInitialStart = true;
    }, REVEAL_TIME + TRANSITION_TIME * 2);

    setTimeout( () => {
        readyStart.classList.toggle('zeroHeight');
        toggleReadyStartText();
    }, REVEAL_TIME + TRANSITION_TIME * 3)

}


function toggleReadyStartText() {
    readyStart.firstElementChild.classList.toggle('buttonHide');
    readyStart.lastElementChild.classList.toggle('buttonHide');
}

function removeOverlay() {
    overlay.classList.add('hideOverlay');
    setTimeout(() => {
        overlay.classList.add('zeroHeight');
    }, TRANSITION_TIME);
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
            checkScore();
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

const startGameAudio = new Audio("assets/sounds/gameStart.wav");
function listenToGameButtons() { 
    // Start pressed
    const startBtn = document.querySelector('#start');
    const startPressed = document.querySelector('.startButton .buttonPressed');
    startBtn.addEventListener('mousedown', () => {
        toggleButton(startBtn, startPressed);
        startGameAudio.play();
    });
    
    startPressed.addEventListener('mouseup', () => {
            toggleButton(startBtn, startPressed)
            setTimeout(() => {
                const overlayText = document.querySelector('.overlayText');
                overlayText.style.display = 'none';
                startGame(numOfCards);
            }, CLICK_START);
        },
        {once: true}
    );

    // pause pressed
    const pauseBtn = document.querySelector('#pause');
    const pausePressed = document.querySelector('.pauseButton');
    pauseBtn.addEventListener('mousedown', () => {
        toggleButton(pauseBtn, pausePressed);
    });
    
    pausePressed.addEventListener('mouseup', () => {
            toggleButton(pauseBtn, pausePressed);
            if (gameInSession) {
                pauseOrResume();
            }
        }
    );

    // resume pressed
    const resumeBtn = document.querySelector('#resume');
    const resumePressed = document.querySelector('.resumeButton');
    resumeBtn.addEventListener('mousedown', () => {
        toggleButton(resumeBtn, resumePressed);
    });
    
    resumePressed.addEventListener('mouseup', () => {
            toggleButton(resumeBtn, resumePressed);
            pauseOrResume();
        }
    );
}

const resumeButtons = document.querySelector('.resumeButtons');
function pauseOrResume() {
    setTimeout(() => {
        pauseGame();
        setTimeout(() => {
            resumeButtons.classList.toggle('buttonHide');
        }, gameInSession ? TRANSITION_TIME : 0)
        }, CLICK_START)
}

function toggleButton(pixelBtn, pixelBtnPressed) {
    pixelBtn.classList.toggle('buttonHide');
    pixelBtnPressed.classList.toggle('buttonHide');

}


let gameRunningTime = 0; 
const pauseSound = new Audio("assets/sounds/pause.wav");
function pauseGame() {
    if (gameInitialStart) {
        pauseSound.play();
        pauseSound.currentTime = 0;
        if (gameInSession) {
            clearInterval(intervalBar);
            clearTimeout(currGameTime);
            let timePaused = (new Date()).getTime();
            gameRunningTime = gameRunningTime + (timePaused - timeAtStart);
            addOverlay();
        } else {
            setTimeout( () => {
                gameTimer(GAME_TIMER - gameRunningTime);
                updateBar();
            }, TRANSITION_TIME);

            removeOverlay();
        }
        gameInSession = !gameInSession;
    }
}

function addOverlay() {
    overlay.classList.remove('hideOverlay');
    overlay.classList.remove('zeroHeight');
}

function addPoint() {
    score += 1;
}

function checkScore() {
    if (score === numOfCards / 2) {
        setTimeout(roundWon, TRANSITION_TIME);
    }
}

const wonTheGameEffect = new Audio("assets/sounds/gameWon.wav");
const winningSound = new Audio("assets/sounds/roundComplete.wav");
const winRoundText = document.querySelector('.alertText.win');
function roundWon() {
    gameInSession = false;
    clearInterval(intervalBar);
    clearTimeout(currGameTime);

    if (round < MAX_ROUNDS) {
        winningSound.play();
        addMessage(winRoundText);
        nextButtonTrigger();
    } else {
        wonTheGameEffect.play();
        playAgainPrompt();
    }
}


function nextButtonTrigger() {
    const nextBtn = document.querySelector('#next');
    const nextPressed = document.querySelector('.nextButton');
    const nextRoundSound = new Audio("assets/sounds/nextRound.wav");
    nextBtn.addEventListener('mousedown', () => {
        nextRoundSound.play();
        toggleButton(nextBtn, nextPressed);
    }, {once: true});
    nextPressed.addEventListener('mouseup', () => {
        toggleButton(nextBtn, nextPressed);
        startNextRound();
    }, {once: true});
}

function startNextRound() {
    // remove text and assets
    const winText = document.querySelector('.alertText.win');
    winText.classList.remove('alertFlex');
    removeCards();

    // reset bar
    width = INITIAL_WIDTH;
    bar.removeAttribute('style');

    // reset score and timers
    gameRunningTime = 0;
    score = 0;

    // start next round
    numOfCards += 8;
    createCards();
    startGame();
}

const winOrLoseText = document.querySelector('.alertText.winOrLose');
function playAgainPrompt() {
    winOrLoseText.firstElementChild.textContent = 'You have finished the game!';
    addMessage(winOrLoseText);
    handleRestart();
}

function playAgain() {
    winOrLoseText.classList.toggle('alertFlex');
    removeCards();

    // reset
    width = INITIAL_WIDTH;
    bar.removeAttribute('style');
    gameRunningTime = 0;
    round = 0;
    score = 0;
    cardOne = null;
    cardTwo = null;

    numOfCards = INITIAL_CARD_COUNT;
    createCards();
    startGame();
}

function removeCards() {
    const gameWindow = document.querySelector('.gameWindow');
    const cards = gameWindow.children;
    Array.from(cards).forEach( (card) => {
        card.remove();
    })
}

let intervalBar;
let currGameTime; 
let timeAtStart;
function gameTimer(time) {
    timeAtStart = (new Date()).getTime();
    currGameTime = setTimeout(endGame , time);
}

const bar = document.querySelector('.timeBar');
const INITIAL_WIDTH = 90 + '%';
let width = INITIAL_WIDTH;
function updateBar() {
    const remPercent = getPercentToSubtract();
    intervalBar = setInterval( () => {
        updateGameBar(remPercent)
        }, BAR_SHRINK_TIME);
}



function updateGameBar(numToRemove) {
    if (gameInSession) {
        width = (width.slice(0, -1) - numToRemove) + '%';
        bar.style.width = width;
    }
}

function getPercentToSubtract() {
    return (INITIAL_WIDTH.slice(0, -1) / (GAME_TIMER / BAR_SHRINK_TIME))
}


const loseGameSound = new Audio("assets/sounds/gameOver.wav");
function endGame() {
    gameInSession = false;
    if (score < numOfCards / 2) {
        loseGameSound.play();
        toggleAllCards(SHOW_CARD);
        clearInterval(intervalBar);
        winOrLoseText.firstElementChild.textContent = 'Game Over';
        addMessage(winOrLoseText);
        handleRestart();
    }
}

function handleRestart() {
    const restartBtn = document.querySelector('#newGame');
    const restartPressed = document.querySelector('.newGameButton');
    
    restartBtn.addEventListener('mousedown', () => {
        toggleButton(restartBtn, restartPressed);
        startGameAudio.play();
    }, {once: true});
    restartPressed.addEventListener('mouseup', (event) => {
        toggleButton(restartBtn, restartPressed);
        playAgain();
    }, {once: true});
}

function addMessage(text) {
    text.classList.add('alertFlex');
    addOverlay();
}

function checkWindowClose() {
    window.addEventListener('beforeunload', (event) => {
        if (gameInitialStart) {
            if (gameInSession) {
                pauseGame();
                resumeButtons.classList.toggle('buttonHide');
            }
            event.preventDefault();
            return "Are you sure?";
        }
    });
}

// Pause when changing tabs
window.addEventListener('blur', () => {
    if (gameInSession) {
        pauseGame();
        resumeButtons.classList.toggle('buttonHide');
    }
});

// Prevent dragging and highlighting
window.addEventListener('mousedown', (event) => {
    event.preventDefault();
});


createCards(numOfCards);
listenToGameButtons();
checkWindowClose();