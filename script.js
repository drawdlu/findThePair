const INITIAL_CARD_COUNT = 12;
const ROW_NUMBER = 4;
const CARD_SHOW_TIME = 800;
const TRANSITION_TIME = 1000;
const GAME_TIMER = 1000;
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
let loseGame = false;

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
                roundWon();
            }
        }
    }
}

// Game logic
const REVEAL_TIME = 1000;

const overlay = document.querySelector('.overlay');

function startGame() {
    round += 1;

    // remove overlay from display
    removeOverlay();

    // display cards for a short time
    setTimeout(() => {
        toggleAllCards(SHOW_CARD);
    }, TRANSITION_TIME);

    setTimeout(() => {
        toggleAllCards(HIDE_CARD);
    }, TRANSITION_TIME + REVEAL_TIME);

    // start game
    setTimeout(() => {
        listenToCardClicks();
        gameTimer(GAME_TIMER);
        updateBar();
        gameInSession = true;
        gameInitialStart = true;
    }, REVEAL_TIME + TRANSITION_TIME * 2);

}

function removeOverlay() {
    overlay.classList.add('hideOverlay');
    setTimeout(() => {
        const overlayText = document.querySelector('.overlayText');
        overlayText.style.display = 'none';
        overlay.classList.toggle('zeroHeight');
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
const startPressed = document.querySelector('.startButton .buttonPressed');
const pauseBtn = document.querySelector('#pause');
const pausePressed = document.querySelector('.pauseButton');
const resumeButtons = document.querySelector('.resumeButtons');
const resumeBtn = document.querySelector('#resume');
const resumePressed = document.querySelector('.resumeButton');

function listenToGameButtons() { 
    // Start pressed
    startBtn.addEventListener('mousedown', (event) => {
        toggleButton(event);
    });
    
    startPressed.addEventListener('mouseup', 
        (event) => {
            toggleButton(event)
            setTimeout(() => {
                startGame(numOfCards)
            }, CLICK_START)
        },
        {once: true}
    );

    // pause pressed
    pauseBtn.addEventListener('mousedown', (event) => {
        toggleButton(event);
    });
    
    pausePressed.addEventListener('mouseup', 
        (event) => {
            toggleButton(event);
            if (gameInSession) {
                pauseOrResume();
            }
        }
    );

    // resume pressed
    resumeBtn.addEventListener('mousedown', (event) => {
        toggleButton(event);
    });
    
    resumePressed.addEventListener('mouseup', 
        (event) => {
            toggleButton(event);
            pauseOrResume();
        }
    );
}

function pauseOrResume() {
    setTimeout(() => {
        pauseGame();
        setTimeout(() => {
            resumeButtons.classList.toggle('buttonHide');
        }, gameInSession ? TRANSITION_TIME : 0)
    }, CLICK_START)
}

function toggleButton(pixelBtn) {
    const currentButton = pixelBtn.target;
    if (currentButton === startBtn || currentButton === startPressed) {
        startBtn.classList.toggle('buttonHide');
        startPressed.classList.toggle('buttonHide');
    } else if (currentButton === pauseBtn || currentButton === pausePressed) {
        pauseBtn.classList.toggle('buttonHide');
        pausePressed.classList.toggle('buttonHide');
    } else if (currentButton === resumeBtn || currentButton === resumePressed) {
        resumeBtn.classList.toggle('buttonHide');
        resumePressed.classList.toggle('buttonHide');
    } else if (currentButton === nextBtn || currentButton === nextPressed) {
        nextBtn.classList.toggle('buttonHide');
        nextPressed.classList.toggle('buttonHide');
    }
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

function toggleOverlay() {
    overlay.classList.toggle('hideOverlay');
    setTimeout(() => {
        overlay.classList.toggle('zeroHeight');
    }, gameInSession ? 0 : TRANSITION_TIME)
    
}

function addPoint() {
    score += 1;
}

function checkScore() {
    if (score === numOfCards / 2) {
        roundWon();
    }
}


const winningSound = new Audio("assets/sounds/winRound.wav");
const nextBtn = document.querySelector('#next');
const nextPressed = document.querySelector('.nextButton');
const winOrLose = document.querySelector('.alertText.winOrLose');
function roundWon() {
    winningSound.play();
    gameInSession = false;
    clearInterval(intervalBar);
    clearTimeout(currGameTime);

    if (round < MAX_ROUNDS) {
        toggleMessage(winOrLose);
        overlay.classList.toggle('zeroHeight');
        nextButtonTrigger();
    } else {
        playAgainPrompt();
    }
}

function nextButtonTrigger() {
    nextBtn.addEventListener('mousedown', toggleButton);
    nextPressed.addEventListener('mouseup', (event) => {
        toggleButton(event);
        startNextRound();
    }, {once: true})
}

function startNextRound() {
    // remove text and assets
    const winText = document.querySelector('.alertText.win');
    winText.classList.toggle('alertFlex');
    removeCards();
    removeNextListeners();

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

function removeNextListeners() {
    nextBtn.removeEventListener('mousedown', toggleButton);
    nextPressed.removeEventListener('mouseup', (event) => {
        toggleButton(event);
        startNextRound();
    }, {once: true})
}

function playAgainPrompt() {
    const winText = document.querySelector('.alertText.wonGame');
    toggleMessage(winText);
    overlay.classList.toggle('zeroHeight');
    const playAgainBtn = document.querySelector('#playAgain');
    playAgainBtn.addEventListener('click', playAgain);
}

function newGameClick() {

}

function playAgain() {
    if (loseGame) {
        const loseText = document.querySelector('.alertText.lose');
        loseText.classList.toggle('alertFlex');
    } else {
        const winText = document.querySelector('.alertText.wonGame');
        winText.classList.toggle('alertFlex');
    }

    removeCards();

    loseGame = false;

    // reset bar
    width = INITIAL_WIDTH;
    bar.removeAttribute('style');
    gameRunningTime = 0;
    round = 0;
    score = 0;
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
        toggleAllCards(SHOW_CARD);
        loseGameSound.play();
        clearInterval(intervalBar);
        winOrLose.firstElementChild.textContent = 'Game Over';
        toggleMessage(winOrLose);

        overlay.classList.toggle('zeroHeight');

        loseGame = true;

        const restart = document.querySelector('#restart');
        restart.addEventListener('click', playAgain);
    }
}

function toggleMessage(text) {
    text.classList.toggle('alertFlex');
    overlay.classList.toggle('hideOverlay');
}

function checkWindowClose() {
    window.addEventListener('beforeunload', (event) => {
        if (gameInitialStart) {
            if (gameInSession) {
                pauseGame();
            }
            event.preventDefault();
            return "Are you sure?";
        }
    });
}

// Pause when changing tabs
// window.addEventListener('blur', () => {
//     if (gameInSession) {
//         pauseGame();
//     }
// });

createCards(numOfCards);
listenToGameButtons();
checkWindowClose();