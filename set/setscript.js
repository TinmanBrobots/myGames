const CARDSIZE = 4;
const NUMROWS = 3;
const NUMARRAY = Array.from(Array(numCardsInPlay).keys());

const IMGNAMES = [['r', 'g', 'p'], ['f', 'h', 'e'], ['o', 'd', 's']];
const KEYMAPPINGS = ['KeyQ', 'KeyA', 'KeyZ', 'KeyW', 'KeyS', 'KeyX', 'KeyE', 'KeyD', 'KeyC', 'KeyR', 'KeyF', 'KeyV', 'KeyT', 'KeyG', 'KeyB', 'KeyY', 'KeyH', 'KeyN', 'KeyU', 'KeyJ', 'KeyM', 'KeyI', 'KeyK', 'Comma', 'KeyO', 'KeyL', 'Period', 'KeyP', 'Semicolon', 'Slash', 'BracketLeft', 'Quote', 'ShiftRight'];
const TWOPLAYER = [0, 15, 18, 33];
const KEYBUTTONS = ['Escape', 'ArrowRight', 'Backslash', 'Backspace', 'Backquote']; // New Game, Reveal Set, Add Cards

const IMGPATH = './setshapes/';

const colDark = '#142d4c';
const colMed = '#385170';
const colLight = '#9fd3c7';
const colWhite = '#ececec';
const colBlack = 'black';
const col1 = '#ff9a3c';
const col2 = '#ff0000';

const P1COLOR = col1;
const P2COLOR = col2;
const CARDCOLOR = colWhite;
const CARDHIGHLIGHT = colLight;
const BUTTONCOLOR = colDark;
const BUTTONHIGHLIGHT = colLight;
const SMALLBORDERCOLOR = colBlack;
const BORDERSIZE = '5px';
const SMALLBORDERSIZE = '1px';
const ADJ = 2*(BORDERSIZE.split('px')[0] - SMALLBORDERSIZE.split('px')[0]);


// Shuffle cards
function shuffle(array) {
    let l = array.length;
    for (var i = l - 1; i > 0; i--) {
        let j = Math.floor(Math.random() * (i + 1));
        let tmp = array[i];
        array[i] = array[j];
        array[j] = tmp;
    }
    return array;
}

// cardId => [color, fill, shape, number]
function parseCard(cardId) {
    let ret = Array(CARDSIZE);
    for (var i = 0; i < CARDSIZE; i++) {
        ret[i] = cardId % 3;
        cardId = Math.floor(cardId/3);
    }
    return ret; 
}

// Clicking Board
function select(target, player2){
    var pos = parseInt(target.id);
    let playerSelectedCards = player2 ? selectedCards2 : selectedCards;
    var toggleOn = !(playerSelectedCards.includes(pos));
    toggleCardBorder(pos, toggleOn, player2);
    toggleOn ? playerSelectedCards.push(pos) : playerSelectedCards.splice(playerSelectedCards.indexOf(pos), 1);

    if (playerSelectedCards.length === 3) { handleGuess(player2); }
}

// Check if guess is valid and call for board/stat updates
function handleGuess(player2) {
    var validSet = validateSet(player2);
    if (validSet) {
        if (!player2 && firstSet) {
            document.contains(lastSetList2) ? lastSetList2.insertAdjacentElement('beforebegin', lastSetList) : document.getElementById("game").appendChild(lastSetList);
            firstSet = false;
        }
        if (player2 && firstSet2) {
            document.getElementById("game").appendChild(lastSetList2);
            firstSet2 = false;
        }
        player2 ? foundSets2 += 1 : foundSets += 1;
        updateLastSet(player2);
        replaceCards(player2);
        if (numCardsInPlay < (twoPlayer ? 15 : 21) && !deckEmpty) { addCardsButton.disabled = false; }
        updateScoreBoard(player2);
        unselectAll(true);
        unselectAll(false);
        lastTime = 0;
        document.getElementById("lastSetTime").innerHTML = "This Set<br>" + lastTime;
        if (!gameOver) {
            clearInterval(lastTimerId);
            lastTimerId = setInterval(() => document.getElementById("lastSetTime").innerHTML = "This Set<br>" + ++lastTime, 1000);
        }
        renderBoard(false);
    }
    else {
        unselectAll(player2);
        renderBoard(false);
        rehighlight(!player2);
    }
}

// Checks for valid set in selectedCards
function validateSet(player2) {
    let playerSelectedCards = player2 ? selectedCards2 : selectedCards;
    let cardArrays = playerSelectedCards.map(x => parseCard(cardsInPlayId[x]));
    for (var i = 0; i < CARDSIZE; i++){
        if ((cardArrays[0][i] + cardArrays[1][i] + cardArrays[2][i]) % 3 !== 0) { return false; }
    }
    return true;
}

// Empties selectedCards and removes card highlights
function unselectAll(player2) {
    let playerSelectedCards = player2 ? selectedCards2 : selectedCards;
    while (playerSelectedCards.length > 0) {
        toggleCardBorder(playerSelectedCards.pop(), false, player2);
    }
}

// Removes/replaces cards and checks for empty deck/game over
function replaceCards(player2) {
    let playerSelectedCards = player2 ? selectedCards2 : selectedCards;
    sortedSelectedCards = playerSelectedCards.sort((a,b) => a-b).reverse();
    for (var i = 0; i < playerSelectedCards.length; i++) {
        (deckEmpty || numCardsInPlay !== 12) ? removeCard(sortedSelectedCards[i]) : replaceCard(playerSelectedCards[i]);
    }
    if (deckTop === deck.length) { handleDeckEmpty(); }
}

// Updates value in cardsInPlayId and changes the figure on card
function replaceCard(pos) {
    cardsInPlayId[pos] = deck[deckTop++];
    addImg(pos);
}

// Removes card at pos from cardsInPlayId
function removeCard(pos) {
    cardsInPlayId.splice(pos, 1);
    numCardsInPlay--;
}

// Adds new column of cards, only clickable with < 21/15 cards in play, > 0 cards in deck
function addCards(){
    cardsOnBoard.length += 3;
    for (var i = 0; i < NUMROWS; i++) {
        cardsInPlayId.push(deck[deckTop++]);
        let pos = numCardsInPlay + i;
        let row = document.getElementById("row" + i.toString());
        let cardSlot = createCardSlot(pos);
        row.appendChild(cardSlot);
        addImg(pos);
    }
    numCardsInPlay += NUMROWS;
    if (numCardsInPlay >= (twoPlayer ? 15 : 21)) { addCardsButton.disabled = true; }

    unselectAll(true);
    unselectAll(false);
    renderBoard(false);
    toggleButtonHighlight(addCardsButton, false);
    mustAddCards = false;

    if (deckTop === deck.length) { handleDeckEmpty(); }
    if (twoPlayer && numCardsInPlay === 15 && findSet[0] === -1) { handleGameOver(); }
}

// Prepends the last found set as a row to a table of found sets
function updateLastSet(player2) {
    let row = document.createElement("tr");
    for (var i = 0; i < 3; i++) {
        // Create new smallCard
        let cardSlot = document.createElement("td");
        let card = document.createElement("div");
        card.className = "smallCard";
        card.id = "last" + i.toString();
        card.backgroundColor = CARDCOLOR;

        // Attach figures to smallCard
        let playerSelectedCards = player2 ? selectedCards2 : selectedCards;
        var parsedCard = parseCard(cardsInPlayId[playerSelectedCards[i]]);
        var src = IMGPATH + parsedCard.slice(0, 3).map((x, j) => IMGNAMES[j][x]).join('') + '.png';
        for (var j = 0; j < parsedCard[3] + 1; j++) {
            let img = document.createElement("img");
            img.src = src;
            img.className = "figure";
            card.appendChild(img);
        }

        cardSlot.appendChild(card);
        row.appendChild(cardSlot);
    }

    // Add time to find set
    let timeSlot = document.createElement("td");
    let thisSetTime = document.createElement("p");
    thisSetTime.innerHTML = lastTime.toString() + "s";
    timeSlot.appendChild(thisSetTime);
    row.appendChild(timeSlot);

    player2 ? lastSetList2.prepend(row) : lastSetList.prepend(row);    
}

// Adds/removes border from selected card
function toggleCardBorder(pos, toggleOn, player2) {
    let alreadyOn = player2 ? selectedCards.includes(pos) : selectedCards2.includes(pos);

    var card = cardsOnBoard[pos];
    var adjust =  alreadyOn ? 0 : (toggleOn ? ADJ : -ADJ);
    if (alreadyOn) {
        card.style.boxShadow = toggleOn ? '0px 0px 0px ' + BORDERSIZE + ' ' + P1COLOR : '';
        card.style.border = BORDERSIZE + ' dashed ' + (toggleOn ?  P2COLOR : (player2 ? P1COLOR : P2COLOR));
    }
    else {
        card.style.border = toggleOn ? BORDERSIZE + ' dashed ' + (player2 ? P2COLOR : P1COLOR) : SMALLBORDERSIZE + ' solid ' + SMALLBORDERCOLOR;
    }
    card.style.width = `${getComputedStyle(card).width.split('px')[0] - adjust}px`;
    card.style.height = `${getComputedStyle(card).height.split('px')[0] - adjust}px`;
}

function rehighlight(player2) {
    let playerSelectedCards = player2 ? selectedCards2 : selectedCards;
    for (var i = 0; i < playerSelectedCards.length; i++) {
        toggleCardBorder(playerSelectedCards[i], true, player2);
    }
}

// Finds a set and returns its positions (or [-1, -1, -1])
function findSet() {
    let cardArrays = cardsInPlayId.map(x => parseCard(x));
    for (var i = 0; i < numCardsInPlay-2; i++) {
        for (var j = i+1; j < numCardsInPlay-1; j++) {
            let k = cardsInPlayId.findIndex(x => x === missingCardId(cardArrays, i, j), j + 1);
            if (k >= 0) { 
                return [i, j, k];
            }
        }
    }
    return [-1, -1, -1];
}

// Shows a set on the board if one exists
function showSet() {
    let set = findSet();
    if (set[0] === -1) {
        toggleButtonHighlight(addCardsButton, true);
        mustAddCards = true;
        return;
    }
    for (var i = 0; i < set.length; i++) {
        let card = cardsOnBoard[set[i]];
        card.style.backgroundColor = setShown ? CARDCOLOR : CARDHIGHLIGHT;
        document.getElementById("showset").innerHTML = setShown ? "Reveal Set<br>[ right ]" : "Hide Set<br>[ right ]";
    }
    setShown = !(setShown);
}

// Returns the id of the third card in a set, given the first two (with passed array of parsed cards)
function missingCardId(cardArrays, pos1, pos2) {
    var A = cardArrays[pos1];
    var B = cardArrays[pos2];
    var ret = 0;
    for (var i = CARDSIZE-1; i >= 0; i--) {
        ret = (ret * 3) + ((A[i] === B[i]) ? A[i] : (3 - A[i] - B[i])%3)
    }
    return ret;
}

// With pos's cardId already in cardsInPlayId, retreives figure and adds img to card
function addImg(pos) {
    var arr = parseCard(cardsInPlayId[pos]);
    var src = IMGPATH + arr.slice(0, 3).map((x, i) => IMGNAMES[i][x]).join('') + '.png';
    cardsOnBoard[pos].innerHTML = '';
    for (var i = 0; i < arr[3] + 1; i++) {
        let cardImg = document.createElement("img");
        cardImg.className = "figure";
        cardImg.src = src;
        cardsOnBoard[pos].appendChild(cardImg);
        twoPlayer ? null : cardImg.addEventListener('click', e => select(e.target.parentElement));
    }
}

// Creates a card with id pos within a card slot, returns card slot
function createCardSlot(pos) {
    let cardSlot = document.createElement("td");
    let card = document.createElement("div");
    card.className = "card";
    card.id = pos.toString();
    card.backgroundColor = CARDCOLOR;
    twoPlayer ? null : card.addEventListener('click', e => select(e.target));
    cardsOnBoard[pos] = card;
    cardSlot.appendChild(card);
    return cardSlot;
}

function handleKeyDown(key) {
    let id = KEYMAPPINGS.findIndex(x => x == key);
    if (!twoPlayer && id >= 0 && id < numCardsInPlay) {
        paused ? null : select(document.getElementById(id)); 
        return;
    }
    if (twoPlayer && id >= 0) {
        if (id >= TWOPLAYER[0] && id <= TWOPLAYER[1] && id <= numCardsInPlay) {
            paused ? null : select(document.getElementById(id), false);
        }
        if (id >= TWOPLAYER[2] && id <= TWOPLAYER[3] && id - TWOPLAYER[2] <= numCardsInPlay) {
            paused ? null : select(document.getElementById(id - TWOPLAYER[2]), true);
        }
    }
}

function handleKeyUp(key) {
    let button = KEYBUTTONS.findIndex(x => x == key);
    switch (button) {
        case 0:
            newGame();
            break;
        case 1:
            (paused || gameOver) ? null : showSet();
            break;
        case 2:
            (paused || addCardsButton.disabled || gameOver) ? null : addCards() ;
            break;
        case 3:
            (gameOver) ? none : togglePause();
            break;
        case 4:
            toggleTwoPlayer();
            break;
    }
}

// Renders a new board from given values
function renderBoard(isNewGame) {
    // Clear board and remove highlights
    board.innerHTML = '';

    cardsOnBoard.length = numCardsInPlay;
    for (var i = 0; i < NUMROWS; i++) {
        let row = document.createElement("tr");
        row.id = "row" + i.toString();
        for (var j = 0; j < numCardsInPlay/NUMROWS; j++) {
            let pos = 3 * j + i;
            let cardSlot = createCardSlot(pos);
            row.appendChild(cardSlot);
            isNewGame ? replaceCard(pos) : addImg(pos);
        }
        board.appendChild(row);
    }

    showSetButton.innerHTML = "Reveal Set<br>[ right ]";
    pauseButton.innerHTML = "Pause<br>[ delete ]"
    setShown = false;
}

function updateScoreBoard() {
    document.getElementById("numSetsFound").innerHTML = (
        twoPlayer ? 
        "P1 &ensp; " + foundSets + "<br> P2 &ensp; " + foundSets2 : 
        "Sets Found<br>" + foundSets
    );
    document.getElementById("numCardsInDeck").innerHTML = "Cards In Deck<br>" + (81 - deckTop).toString();
    document.getElementById("currGameTime").innerHTML = "Time Elapsed<br>" + time;
    document.getElementById("lastSetTime").innerHTML = "This Set<br>" + lastTime;
}

function handleDeckEmpty() {
    addCardsButton.disabled = true;
    deckEmpty = true;
    if (findSet()[0] === -1) { handleGameOver(); }
}

function handleGameOver() {
    clearInterval(timerId);
    clearInterval(lastTimerId);
    toggleButtonHighlight(newGameButton, true);
    toggleButtonHighlight(addCardsButton, false);
    mustAddCards = false;
    addCardsButton.disabled = true;
    showSetButton.disabled = true;
    pauseButton.disabled = true;
    gameOver = true;
}

function togglePause() {
    if (!paused) {
        board.innerHTML = '';
        pauseState = [addCardsButton.disabled, mustAddCards];
        clearInterval(timerId);
        clearInterval(lastTimerId);
        pauseButton.innerHTML = 'Resume<br>[ delete ]';
        showSetButton.disabled = true;
        addCardsButton.disabled = true;
    }
    else {
        renderBoard(false);
        timerId = setInterval(() => document.getElementById("currGameTime").innerHTML = "Time Elapsed<br>" + ++time, 1000);
        lastTimerId = setInterval(() => document.getElementById("lastSetTime").innerHTML = "This Set<br>" + ++lastTime, 1000);
        pauseButton.innerHTML = 'Pause<br>[ delete ]';
        showSetButton.disabled = false;
        addCardsButton.disabled = pauseState[0];
        toggleButtonHighlight(addCardsButton, pauseState[1]);
    }
    paused = !paused;
}

function toggleTwoPlayer() {
    twoPlayer = !twoPlayer;
    twoPlayerButton.innerHTML = twoPlayer ? "Single Player<br>[ ` ]" : "Two Player<br>[ ` ]";
    newGame();
    updateScoreBoard();
}

function toggleButtonHighlight(button, toggleOn) {
    if (toggleOn) {
        button.style.backgroundColor = BUTTONHIGHLIGHT;
        button.style.color = colDark;
    }
    else {
        button.style.backgroundColor = BUTTONCOLOR;
        button.style.color = colWhite;
    }
}

function newGame() {
    deck = shuffle(deck);
    deckTop = 0;
    numCardsInPlay = 12;
    cardsInPlayId = NUMARRAY.map(x => deck[x]); // {0,...,11} --> {0,...,80}
    cardsOnBoard = Array(numCardsInPlay);
    selectedCards = []; // references board position
    selectedCards2 = [];
    sortedSelectedCards = [];

    firstSet = true;
    firstSet2 = true;
    setShown = false;
    deckEmpty = false;
    paused = false;
    gameOver = false;
    mustAddCards = false;

    foundSets = 0;
    foundSets2 = 0;
    time = 0;
    lastTime = 0;

    document.getElementById("currGameTime").innerHTML = "Time Elapsed<br>" + time;
    document.getElementById("lastSetTime").innerHTML = "This Set<br>" + lastTime;

    renderBoard(true);
    updateScoreBoard();

    clearInterval(timerId);
    clearInterval(lastTimerId);

    timerId = setInterval(() => document.getElementById("currGameTime").innerHTML = "Time Elapsed<br>" + ++time, 1000);
    lastTimerId = setInterval(() => document.getElementById("lastSetTime").innerHTML = "This Set<br>" + ++lastTime, 1000);

    toggleButtonHighlight(newGameButton, false);
    toggleButtonHighlight(addCardsButton, false);
    showSetButton.disabled = false;
    addCardsButton.disabled = false;
    pauseButton.disabled = false;
    lastSetList.innerHTML = '';
    lastSetList2.innerHTML = '';
    document.contains(lastSetList) ? document.getElementById("game").removeChild(lastSetList) : null;
    document.contains(lastSetList2) ? document.getElementById("game").removeChild(lastSetList2) : null;
}

// Starting Board
var deck = shuffle(Array.from(Array(81).keys())); // Cards = [1, ..., 81]
var deckTop = 0;
var numCardsInPlay = 12;
var cardsInPlayId = NUMARRAY.map(x => deck[x]); // {0,...,11} --> {0,...,80}
var cardsOnBoard = Array(numCardsInPlay);
var selectedCards = []; // references board position
var selectedCards2 = [];
var sortedSelectedCards = [];
var pauseState = [false, false]; // addCardsButton disabled?, mustAddCards?

var firstSet = true;
var firstSet2 = true;
var setShown = false;
var deckEmpty = false;
var paused = false;
var gameOver = false;
var twoPlayer = false;
var mustAddCards = false;

var foundSets = 0;
var foundSets2 = 0;
var time = 0;
var lastTime = 0;

var lastSetList = document.createElement("table");
lastSetList.className = "lastset";
lastSetList.style.backgroundColor = P1COLOR;
lastSetList.style.color = colDark;
var lastSetList2 = document.createElement("table");
lastSetList2.className = "lastset";
lastSetList2.style.backgroundColor = P2COLOR;
lastSetList2.style.color = colWhite;

var newGameButton = document.getElementById("newgame");
var showSetButton = document.getElementById("showset")
var addCardsButton = document.getElementById("addcards");
var pauseButton = document.getElementById("pause");
var twoPlayerButton = document.getElementById("twoplayer");
var board = document.getElementById("board");
document.addEventListener('keydown', (keyPressed) => handleKeyDown(keyPressed.code));
document.addEventListener('keyup', (keyPressed) => handleKeyUp(keyPressed.code));


renderBoard(true);
updateScoreBoard();

var timerId = setInterval(() => document.getElementById("currGameTime").innerHTML = "Time Elapsed<br>" + ++time, 1000);
var lastTimerId = setInterval(() => document.getElementById("lastSetTime").innerHTML = "This Set<br>" + ++lastTime, 1000);



/*
To Do:
> Performance Graphics/Fun Statistics (eg Set Similarity Score)
> Leaderboard
> Online Real-Time Play
*/