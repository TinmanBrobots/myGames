// Board Constants
const BOARDSIZE = 8;
const PIECES = {
    King: {
        Moves:
    },
    Queen: {

    },
    Bishop: {

    },
    Knight: {

    },
    Rook: {

    },
    Pawn: {

    }
};
const PROMOTION_PIECES = ['R', 'N', 'B', 'Q'];
let ADDITIONAL_PIECES = [];

// Color Markers
const WHITE = 1;
const BLACK = -1;

// Border Adjustments
const HIGHLIGHT_BORDER_SIZE = '4px';
const HIGHLIGHT_COLOR = 'red';
const BORDER_SIZE = '1px';
const BORDER_COLOR = 'black'
const ADJ = 2*(HIGHLIGHT_BORDER_SIZE.split('px')[0] - BORDER_SIZE.split('px')[0]);

// Board Construction
let boardArray = Array(BOARDSIZE**2).fill(0);
let boardColors = Array(BOARDSIZE**2).fill(0);
const board = document.getElementById('board');
const rows = Array(BOARDSIZE);
let selectedSquare = -1;
let selectedPiece = 0;

// Colors
const lightColor = 'white';
const darkColor = 'green';

class Piece {
    constructor(name, color, row, col) {
        this.name = name; // Full Word
        this.color = color; // white == 1, black == -1
        this.pos = [row, col]; // eg b4
        this.unmoved = true; // in starting position?
    }

    get moves() {
        return this.computeMoves();
    }

    computeMoves() {
        var moves = []
        var multiple = false;
        switch (this.name) {
            case 'King':
                moves = [[1,0], [1,1], [0,1], [-1,1], [-1,0], [-1,-1], [0,-1], [1,-1]];
                let castles = checkCanCastle(color);
                // NEED TO HANDLE CASTLING
                break;
            case 'Queen':
                moves = [[1,0], [1,1], [0,1], [-1,1], [-1,0], [-1,-1], [0,-1], [1,-1]];
                multiple = true;
                break;
            case 'Bishop':
                moves = [[1,1], [-1,1], [-1,-1], [1,-1]];
                multiple = true;
                break;
            case 'Knight':
                moves = [[2,1], [1,2], [-1,2], [-2,1], [-2,-1], [-1,-2], [1,-2], [2,-1]];
                break;
            case 'Rook':
                moves = [[1,0], [0,1], [-1,0], [0,-1]];
                break;
            case 'Pawn':
                moves = [[this.color,0]];
                if (this.unmoved) {
                    moves.push([2*this.color,0]);
                }
                if (hasPiece(-this.color, this.row + this.color, this.col + 1)) {
                    moves.push([this.color,1]);
                }
                if (hasPiece(-this.color, this.row + this.color, this.col - 1)) {
                    moves.push([this.color,-1]);
                }
                // NEED TO HANDLE EN PASSANT
                break;
        }
        moves = removeInvalid(moves, pos);
        for (var i = 0; i < moves.length; i++) {
            // handle multiple
        }

        return moves;
    }
}

function checkCanCastle(color) {
    let king = board[(color > 0 ? 0 : BOARDSIZE-1)][5];
    let aRook = board[(color > 0 ? 0 : BOARDSIZE-1)][0];
    let hRook = board[(color > 0 ? 0 : BOARDSIZE-1)][BOARDSIZE-1];
    let ret = [false, false];
    if (king.name == "King" && king.color == color && king.unmoved) {
        ret = [(aRook.name == "Rook" && aRook.color == color && aRook.unmoved), (hRook.name == "Rook" && hRook.color == color && hRook.unmoved)];
    }

    return ret;
}

function removeInvalid(moves, pos){
    return;
}

function hasPiece(color, row, col){
    return board[row][col].color === color;
}

// Converts pos (0,63) to coords (0/0, 8/8)
function pos2coords(pos) {
    return [Math.floor(pos / BOARDSIZE), pos % BOARDSIZE];
}

// Click Handler
function select(target){
    let square = (target.nodeName == "DIV") ? target : target.parentElement;
    var pos = parseInt(square.id);
    if (pos == selectedSquare) {
        toggleSquareBorder(pos, false);
        selectedSquare = -1;
    }
    else if (selectedSquare == -1) {
        toggleSquareBorder(pos, true);
        selectedSquare = pos;
    }
    else {
        toggleSquareBorder(selectedSquare, false);
        toggleSquareBorder(pos, true);
        selectedSquare = pos;
    }
}

// (Un)Highlights Clicked Squares
function toggleSquareBorder(pos, toggleOn) {
    var square = document.getElementById(pos);
    square.style.border = toggleOn ? HIGHLIGHT_BORDER_SIZE + ' dashed ' + HIGHLIGHT_COLOR : BORDER_SIZE + ' solid ' + BORDER_COLOR;
    let adjust = toggleOn ? ADJ : -ADJ;
    square.style.width = `${getComputedStyle(square).width.split('px')[0] - adjust}px`;
    square.style.height = `${getComputedStyle(square).height.split('px')[0] - adjust}px`;
}

// Places pieces on new board
function initializeBoard() {
    for (var i = 0; i < BOARDSIZE; i++) {
        setPieceArray(i, PIECES[i], WHITE);
        setPieceArray(BOARDSIZE + i, 'p', WHITE);
        setPieceArray(BOARDSIZE**2 - i - 1, PIECES[BOARDSIZE - i - 1], BLACK);
        setPieceArray(BOARDSIZE**2 - BOARDSIZE - i - 1, 'p', BLACK);
    }
}

// Sets a piece on the board array
function setPieceArray(pos, piece, color) {
    boardArray[pos] = piece;
    boardColors[pos] = color;
}

// Adds pieces to the board
function setPieces() {
    for (var pos = 0; pos < BOARDSIZE**2; pos++) {
        if (boardArray[pos] !== 0) {
            insertPiece(pos, boardArray[pos], boardColors[pos]);
        }
    }
}

// Inserts a single piece on the board
function insertPiece(pos, pieceName, white) {
    let square = document.getElementById(pos.toString());
    square.style.color = white ? 'grey' : 'black'
    let piece = document.createElement("p");
    piece.innerHTML = pieceName;
    square.appendChild(piece);
    let coords = pos2coords(pos);
    boardArray[coords[0]][coords[1]] = pieceName;
}

// Renders the entire board from the boardArray
function renderBoard(flipped) {
    board.innerHTML = "";
    for (var i = BOARDSIZE - 1; i >= 0; i--) {
        rows[i] = document.createElement("tr");
        rows[i].classList.add('row');
        for (var j = 0; j < BOARDSIZE; j++){
            let squareContaner = document.createElement("td");
            let square = document.createElement("div");
            square.classList.add('square');
            square.addEventListener('click', e => select(e.target));
            square.style.backgroundColor = ((i + j) % 2 == flipped) ? lightColor : darkColor;
            square.id = (BOARDSIZE * i + j).toString(); // might want to make an html element for squares
            squareContaner.appendChild(square);
            rows[i].appendChild(squareContaner);
        }
        board.appendChild(rows[i]);
    }
    selectedSquare = -1;
    selectedPiece = 0;
}

let flipped = 0;
renderBoard(false);
initializeBoard();
setPieces();

console.log(boardArray[2]);


/*
To Do:
> Make Piece HTML Item
> Add Moved? identifier for pieces
> Handle Moves
>> Figure out piece
>> Figure out possible moves
>> On Click: check valid move
>> remove piece from square
>> add piece to new square
>> check capture
>> Add valid square highlights
> Check
> Buttons
> Captured pieces
*/