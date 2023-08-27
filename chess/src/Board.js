import { useState, useEffect, useRef } from 'react';
import { n, nArr, nnArr, 
    COLORS, TYPES, 
    emptyBoardState, defaultSetup,
    knightMoves, bishopMoves, rookMoves } from './Constants';
import { toAbs, toCoord, onBoard } from './Helper';
import { Piece } from './Piece';
import './css/board.css';

const _ = require('lodash');
const React = require('react');

/**
 To Do:
 * Add Castling
 * Add En Passante
 * Show Captured Pieces
 * Make it Pretty
 * Add a Clock
 * Add Undo Feature
 * Add Notation
 */


class Board extends React.Component {
    constructor(props) {
        super(props);
        this.state = emptyBoardState();
    }

    componentDidMount() {
        this.setUpNewGame();
    }

    /**
     * Clears the board, resets state values, and sets pieces to default setup
     */
    resetBoard() {
        this.removeHighlights();
        this.setState({ ...(emptyBoardState()) }, () => this.setUpNewGame());
    }

    setUpNewGame() {
        const { data, pieces } = this.state;

        // add pieces
        for (let i = 0; i < 2 * n; i++) {
            let rowIdx = Math.floor(i / n);

            // make and add white piece
            let whitePiece = new Piece({
                type: defaultSetup[i],
                color: COLORS.white
            });
            data[toAbs(rowIdx, i % n)] = whitePiece;
            pieces.white.push(whitePiece);

            // make and add black piece
            let blackPiece = new Piece({
                type: defaultSetup[i],
                color: COLORS.black
            });
            data[toAbs(n - 1 - rowIdx, i % n)] = blackPiece;
            pieces.black.push(blackPiece);
        }
        this.setState({ data });
        return;
    }

    /**
     * Get position of specified piece
     * @param {Piece} piece 
     * @param {Boolean} inCoords determines return format
     * @returns absolute (Int) or coordinate (Array[2]) position of piece
     */
    getPos(piece, inCoords) {
        const { data } = this.state
        const abs = _.findIndex(data, p => p === piece);
        const ret = inCoords ? [...toCoord(abs)] : abs;
        return ret;
    }

    /**
     * Gets piece at a given position
     * @param  {...any} position absolute or coordinate position
     * @returns Piece or null (null if not on board)
     */
    getPiece(...position) {
        const abs = toAbs(...position);
        return (0 <= abs && abs < n*n) ? this.state.data[abs] : null;
    }

    /**
     * Checks is a given position on board is empty
     * @param  {...any} position absolute or coordinate position
     * @returns Boolean (false if not on board)
     */
    isEmpty(...position) {
        return _.isNull(this.getPiece(...position));
    }

    /**
     * Checks if a given position has a piece of a given color
     * @param {Boolean} color T=White / F=Black
     * @param  {...any} position absolute or coordinate position
     * @returns Boolean
     */
    hasPieceOfColor(color, ...position) {
        const foundPiece = this.getPiece(...position);
        return foundPiece && (foundPiece.myColor === color);
    }
    
    /**
     * Check if piece can land on square (move or capture)
     * @param {Piece} piece 
     * @param {Number} row 
     * @param {Number} col 
     * @returns Boolean
     */
    canLand(piece, row, col) {
        if (!onBoard(row, col)) return false;
        return (piece.myType === TYPES.pawn) ? this.isEmpty(row, col) : !this.hasPieceOfColor(piece.myColor, row, col);
    }

    /**
     * Moves piece and updates state values
     * @param {Number} oRow original row
     * @param {Number} oCol original col
     * @param {Number} fRow final row
     * @param {Number} fCol final col
     * @returns Piece captured (null if no capture)
     */
    movePiece(oRow, oCol, fRow, fCol) { // abs, abs
        if (!onBoard(oRow, oCol)) throw new Error(`Selected square is not on board (${oRow}, ${oCol})`);
        if (!onBoard(fRow, fCol)) throw new Error(`Landing square is not on board (${fRow}, ${fCol})`);
        const { data, turnNum } = this.state;
        const piece = this.getPiece(oRow, oCol);
        data[toAbs(oRow, oCol)] = null;
        // check for en passante
        const isEnPassante = (piece.myType === TYPES.pawn) && (Math.abs(oCol - fCol) > 0) && (!this.getPiece(fRow, fCol))
        let capturedPiece = this.handleCapture(isEnPassante ? oRow : fRow, fCol);
        data[toAbs(fRow, fCol)] = piece;
        if (piece.firstMove < 0) {
            piece.firstMove = turnNum;
        }
        // check for castle
        if (piece.myType === TYPES.king && Math.abs(oCol - fCol) > 1) {
            const rookRow = piece.myColor ? 0 : n-1;
            const rookCol = fCol > oCol ? n-1 : 0;
            const castledCol = (oCol + fCol) / 2;
            this.movePiece(rookRow, rookCol, rookRow, castledCol);
        }
        this.setState({ data });
        return capturedPiece;
    }

    /**
     * Removes a captured piece
     * @param {Number} row
     * @param {Number} col
     * @returns Piece captured (null if no capture)
     */
    handleCapture(row, col) {
        const position = toAbs(row, col);
        const { data } = this.state;
        const piece = this.getPiece(position)
        if (!piece) return null;
        piece.capturedPos = position;
        data[position] = null;
        this.setState({ data });
        return piece;
    }

    /**
     * Undoes a move and updates state values (final -> original)
     * @param {Number} fRow final row
     * @param {Number} fCol final col
     * @param {Number} oRow original row
     * @param {Number} oCol original col
     * @param {Piece} capturedPiece (optional) piece captured from move
     * @returns nothing
     */
    undoMove(fRow, fCol, oRow, oCol, capturedPiece) {
        if (!onBoard(fRow, fCol)) throw new Error(`Final square is not on board (${fRow}, ${fCol})`);
        if (!onBoard(oRow, oCol)) throw new Error(`Original square is not on board (${oRow}, ${oCol})`);
        const { data, turnNum } = this.state;
        const piece = this.getPiece(fRow, fCol);
        data[toAbs(fRow, fCol)] = null;
        if (capturedPiece) {
            data[capturedPiece.capturedPos] = capturedPiece
            capturedPiece.capturedPos = -1;
        }
        data[toAbs(oRow, oCol)] = piece;
        if (piece.firstMove >= turnNum - 1) {
            piece.firstMove = -1;
        }
        // check for castle
        if (piece.myType === TYPES.king && Math.abs(oCol - fCol) > 1) {
            const rookRow = piece.myColor ? 0 : n-1;
            const rookCol = fCol > oCol ? n-1 : 0;
            const castledCol = (oCol + fCol) / 2
            this.undoMove(rookRow, castledCol, rookRow, rookCol);
        }
        this.setState({ data });
        return;
    }

    /**
     * Gets all moves of a piece in given direction
     * @param {Piece} piece 
     * @param {*} dir relative direction coordinates
     * @returns array of absolute positions piece can move in direction
     */
    getAllMovesInDir(piece, dir) {
        const { myColor } = piece;
        let [row, col] = this.getPos(piece, true);
        let dirMoves = [];
        row += dir[0];
        col += dir[1];
        while (this.canLand(piece, row, col)) {
            dirMoves.push(toAbs(row, col));
            if (this.hasPieceOfColor(!myColor, row, col)) break; // end search on capture
            row += dir[0];
            col += dir[1];
        }
        return dirMoves;
    }

    /**
     * Get all moves of a piece, not accounting for legality (eg check)
     * @param {Piece} piece 
     * @returns array of absolute positions of moves
     */
    getValidMoves(piece) {
        const { myType, myColor, firstMove } = piece;
        const [row, col] = this.getPos(piece, true);

        // get all unblocked moves
        let pawnDir = myColor ? 1 : -1; //
        let moves = []
        switch (myType) {
            case TYPES.pawn:
                if (this.isEmpty(row + pawnDir, col)) { // if square in front empty
                    moves.push(toAbs(row + pawnDir, col));
                    if (this.isEmpty(row + 2 * pawnDir, col) && firstMove < 0) { // if both empty and is unmoved
                        moves.push(toAbs(row + 2 * pawnDir, col));
                    }
                }
                const canEnPassante = (side) => {
                    if (row != (myColor ? n-4 : 3)) return false;
                    let adjPiece = this.getPiece(row, col + side);
                    return (adjPiece && adjPiece.myType === TYPES.pawn) && (adjPiece.firstMove === this.state.turnNum - 1);
                } 
                // Diagonal Captures
                if (onBoard(row + pawnDir, col + 1) && this.hasPieceOfColor(!myColor, row + pawnDir, col + 1) || canEnPassante(1)) {
                    moves.push(toAbs(row + pawnDir, col + 1));
                }
                if (onBoard(row + pawnDir, col - 1) && this.hasPieceOfColor(!myColor, row + pawnDir, col - 1) || canEnPassante(-1)) {
                    moves.push(toAbs(row + pawnDir, col - 1));
                }
                break;
            
            case TYPES.knight:
                moves = knightMoves.map(dir => {
                    let move = [row + dir[0], col + dir[1]];
                    return this.canLand(piece, ...move) && toAbs(...move);
                })
                moves = _.filter(moves, move => move);
                break;

            case TYPES.bishop:
                moves = bishopMoves.map(dir => this.getAllMovesInDir(piece, dir)).flat();
                break;

            case TYPES.rook:
                moves = rookMoves.map(dir => this.getAllMovesInDir(piece, dir)).flat();
                break;

            case TYPES.queen:
                moves = bishopMoves.map(dir => this.getAllMovesInDir(piece, dir)).flat();
                moves = moves.concat(rookMoves.map(dir => this.getAllMovesInDir(piece, dir)).flat());
                break;

            case TYPES.king:
                moves = (bishopMoves.concat(rookMoves)).map(dir => {
                    let move = [row + dir[0], col + dir[1]];
                    return this.canLand(piece, ...move) && toAbs(...move);
                })
                moves = _.filter(moves, move => move);
                moves = moves.concat(this.getCastles(myColor));
                break;
        }
        return moves;
    }

    getCastles(color) {
        const { pieces } = this.state;
        const myPieces = pieces[color ? "white" : "black"];
        const myRow = color ? 0 : n-1;
        const king = _.find(myPieces, p => p.myType === TYPES.king);
        const ksCorner = this.getPiece(myRow, n-1);
        const qsCorner = this.getPiece(myRow, 0);

        const ret = [];
        if (king.firstMove != -1 || this.checkInCheck(color)) return ret;
        // conditions to castle king-side
        if (
            ksCorner && ksCorner.myType === TYPES.rook && ksCorner.firstMove === -1
            && this.isEmpty(myRow, n-2)
            && this.isEmpty(myRow, n-3)
            && !this.passesThroughCheck(king, toAbs(myRow, n-2), toAbs(myRow, n-3))
        ) {
            ret.push(toAbs(myRow, n-2));
        }

        // conditions to castle queen-side
        if (
            qsCorner && qsCorner.myType === TYPES.rook && qsCorner.firstMove === -1
            && this.isEmpty(myRow, 1)
            && this.isEmpty(myRow, 2)
            && this.isEmpty(myRow, 3)
            && !this.passesThroughCheck(king, toAbs(myRow, 1), toAbs(myRow, 2), toAbs(myRow, 3))
        ) {
            ret.push(toAbs(myRow, 2));
        }
        return ret
    }

    passesThroughCheck(king, ...squares) {
        const oPos = this.getPos(king, true);
        for (var i = 0; i < squares.length; i++) {
            let fPos = toCoord(squares[i]);
            this.movePiece(...oPos, ...fPos);
            if (this.checkInCheck(king.myColor)) {
                this.undoMove(...fPos, ...oPos);
                return true;
            }
            this.undoMove(...fPos, ...oPos);
        }
        return false;
    }

    /**
     * Gets all squares defended by a piece
     * @param {Piece} piece 
     * @returns array of absolute positions
     */
    getDefendedSquares(piece) {
        const { myType, myColor } = piece;
        const [row, col] = this.getPos(piece, true);

        // get all unblocked moves
        let pawnDir = myColor ? 1 : -1;
        let moves = []
        switch (myType) {
            case TYPES.pawn:
                moves.push(toAbs(row + pawnDir, col + 1));
                moves.push(toAbs(row + pawnDir, col - 1));
                break;
            
            case TYPES.knight:
                moves = knightMoves.map(dir => {
                    let move = [row + dir[0], col + dir[1]];
                    return this.canLand(piece, ...move) && toAbs(...move);
                })
                moves = _.filter(moves, move => move);
                break;

            case TYPES.bishop:
                moves = bishopMoves.map(dir => this.getAllMovesInDir(piece, dir)).flat();
                break;

            case TYPES.rook:
                moves = rookMoves.map(dir => this.getAllMovesInDir(piece, dir)).flat();
                break;

            case TYPES.queen:
                moves = bishopMoves.map(dir => this.getAllMovesInDir(piece, dir)).flat();
                moves = moves.concat(rookMoves.map(dir => this.getAllMovesInDir(piece, dir)).flat());
                break;

            case TYPES.king:
                moves = (bishopMoves.concat(rookMoves)).map(dir => {
                    let move = [row + dir[0], col + dir[1]];
                    return this.canLand(piece, ...move) && toAbs(...move);
                })
                moves = _.filter(moves, move => move);
                break;
        }
        return moves;
    }

    checkMoveLegal(piece, fRow, fCol) {
        const [oRow, oCol] = this.getPos(piece, true);
        const capturedPiece = this.movePiece(oRow, oCol, fRow, fCol);
        const ret = !this.checkInCheck(piece.myColor);
        this.undoMove(fRow, fCol, oRow, oCol, capturedPiece);
        return ret;
    }

    /**
     * Get all legal moves a piece can make this turn
     * @param {Piece} piece 
     * @returns array of absolute positions
     */
    getLegalMoves(piece) {
        const validMoves = this.getValidMoves(piece);
        const legalMoves = _.filter(validMoves, finalPos => this.checkMoveLegal(piece, ...toCoord(finalPos)));
        return legalMoves;
    }

    handleEndTurn(oPos, fPos, capturedPiece) {
        const { turn, turnNum, history } = this.state;
        history.push([oPos, fPos, capturedPiece]);
        this.setState({
            turn: !turn,
            turnNum: turnNum + 1,
            selected: -1,
            highlighted: [],
            gameOver: this.getResult(!turn)
        });
        return;
    }

    handleUndoClick() {
        const { turn, turnNum, history } = this.state;
        const [oPos, fPos, capturedPiece] = history.pop();
        this.undoMove(...toCoord(fPos), ...toCoord(oPos), capturedPiece);
        this.setState({
            turn: !turn,
            turnNum: turnNum - 1,
            history,
            gameOver: null
        })
    }

    /**
     * Checks if a given player is in check
     * @param {Boolean} color T=White / F=Black
     * @returns a Piece attacking the king (or null if not in check)
     */
    checkInCheck(color) {
        const { pieces } = this.state;
        const myPieces = pieces[color ? 'white' : 'black'];
        const oppPieces = pieces[color ? 'black' : 'white'];
        let kingPos = this.getPos(_.find(myPieces, p => p.myType === TYPES.king));
        let ret = null;
        _.forEach(oppPieces, p => {
            if (_.includes(this.getDefendedSquares(p), kingPos)) {
                ret = p;
                return false;
            }
        });
        return ret;
    }

    /**
     * Checks if current player can make a move
     * @returns Boolean
     */
    checkGameOver(turn) { 
        const { pieces } = this.state;
        return !_.some(
                    _.filter(pieces[turn ? 'white' : 'black'], p => p.capturedPos === -1) // turn's pieces on board
                        .map(p => this.getLegalMoves(p)), // get their legal moves
                    moves => !_.isEmpty(moves) // find one non-empty
                );
    }

    /**
     * Gets the current status of game
     * @returns Number (null if game not over)
     */
    getResult(turn) {
        if (this.checkGameOver(turn)) {
            if (this.checkInCheck(turn)) {
                return turn ? -1 : 1; // white's turn ? black win : white win
            } else {
                return 0; // stalemate
            }
        }
        return null // null if game not over
    }

    removeHighlights() {
        const { selected, highlighted } = this.state;
        if (selected >= 0) {
            document.getElementById(selected).classList.remove("selected")
        }
        _.forEach(highlighted, pos => {
            document.getElementById(pos).classList.remove("highlighted");
        });
    }

    /**
     * Handles clicking on a piece
     * @param {*} e 
     */
    onSelect(e) {
        // get clicked square
        const clickedElement = e.target;
        const square = ["white", "black"].includes(clickedElement.className)
                         ? clickedElement.parentNode
                         : clickedElement;
        const newSelected = parseInt(square.id);

        // get state values
        const { selected, highlighted, turn } = this.state;

        // Remove selected and highlighteds
        this.removeHighlights();

        // UNSELECT: if newSelected === selected, end
        if (newSelected === selected) {
            this.setState({ selected: -1, highlighted: [] });
        }
        // MOVE: else if newSelected in highlighted, move piece
        else if (highlighted.includes(newSelected)) {
            const capturedPiece = this.movePiece(...toCoord(selected), ...toCoord(newSelected));
            this.handleEndTurn(selected, newSelected, capturedPiece);
        }
        // SELECT: otherwise, select newSelected
        else {
            square.classList.add("selected");
            const newPiece = this.getPiece(newSelected);
            // if turn === myColor, getLegalMoves and highlight
            const newHighlighted = (newPiece && newPiece.myColor === turn) ? this.getLegalMoves(newPiece) : [];
            _.forEach(newHighlighted, pos => {
                document.getElementById(pos).classList.add("highlighted");
            });
            this.setState({ selected: newSelected, highlighted: newHighlighted });
        }

        return;
    }

    // nnArr.map((_, i) => <div className={`input ${i % 2 ? 'dark' : 'light'}`}>{i}</div> );
    render() {
        const { turn, turnNum, gameOver } = this.state;
        const squares = nArr.map((_, r) => {
            return (
                <tr>
                    {nArr.map((_, c) => {
                        const piece = this.getPiece(n-1-r, c);
                        return (
                            <td>
                                <div className={`square ${(r + c) % 2 ? "dark" : "light"}`} id={(n-1-r) * n + c} onClick={(e) => this.onSelect(e)}>
                                    <div className={(piece && piece.myColor) ? "white" : "black"}>{ piece && piece.myType }</div>
                                </div>
                            </td>
                        );
                    })}
                </tr>
            );
        });
        return (
            <div className="board">
                <table>
                    { squares }
                </table>
                <button onClick={() => this.resetBoard()}>Reset Board</button>
                <button onClick={() => this.handleUndoClick()} disabled={!turnNum}>Undo Move</button>
                <div>Turn: {turn ? "White" : "Black"}, Move: #{Math.floor(turnNum/2)+1 }</div>
                {!_.isNull(gameOver) && 
                    <div>
                        {gameOver === 1 && "Checkmate! WHITE Wins"}
                        {gameOver === -1 && "Checkmate! BLACK Wins"}
                        {gameOver === 0 && "Stalemate!"}
                    </div>
                }
            </div>
        )
    }
}

export default Board;