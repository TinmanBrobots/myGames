const _ = require('lodash');

import './css/board.css';

import { useState, useEffect, useRef } from 'react';

const Board = ({ reset, setReset, winner, setWinner }) => {

    const n = 3;
    const P1 = "Player 1";
    const P2 = "Player 2";
    const nArr = Array(n).fill();
    const nnArr = Array(n*n).fill();
    const winLines = [
        //rows
        ...nArr.map((_, i) => nArr.map((_, j) => n * i + j)),
        //cols
        ...nArr.map((_, i) => nArr.map((_, j) => i + n * j)),
        //diags
        nArr.map((_, i) => (n + 1) * i),
        nArr.map((_, i) => (n - 1) * i)
    ]
    console.log(winLines)
    const [turn, setTurn] = useState(0); // tracks current turn
    const [turnNum, setTurnNum] = useState(0); // tracks turn number
    const [data, setData] = useState(nnArr.map(x => 0)); // tracks board values
    const boardRef = useRef(null); // reference to board

    // draw on board
    const draw = (event, index) => {
        if (!data[index] && winner === "") {
            // (turn0, turn1)
            data[index] = 1 - 2 * turn; // (1, -1)
            event.target.innerText = turn ? "O" : "X"; // (X, O)
            setTurn(1 - turn); // (1, 0)
            setTurnNum(turnNum + 1);
        }
    }

    // reset board when a winner is determined
    useEffect(() => {
        setData(nnArr.map(x => 0));
        _.forEach(boardRef.current.children, (cell) => {
            cell.innerText = "";
        });
        setTurn(0);
        setTurnNum(0);
        setWinner("")
        setReset(false);
    }, [reset, setReset, setWinner]);

    // check for winner
    useEffect(() => {
        _.forEach(winLines, line => {
            let sum = 0;
            _.forEach(_.pick(data, line), val => {
                sum += val;
            });
            if (sum === n) {
                setWinner(`${P1} Wins!`);
            } else if (sum === -n) {
                setWinner(`${P2} Wins!`);
            }
        });

        if (turnNum === n*n) setWinner("It's a Tie!");
    });

    // const boardSquares = nnArr.map((_, i) => {
    //     (<div className={`input input-${i}`} onClick={(e) => draw(e, i)}></div>)
    // });

    return (
        <div ref={boardRef} className="board">
            {/* {boardSquares[0]}
            {boardSquares[1]}
            {boardSquares[2]}
            {boardSquares[3]}
            {boardSquares[4]}
            {boardSquares[5]}
            {boardSquares[6]}
            {boardSquares[7]}
            {boardSquares[8]} */}
            {<div className={`input input-${0}`} onClick={(e) => draw(e, 0)}></div>}
            {<div className={`input input-${1}`} onClick={(e) => draw(e, 1)}></div>}
            {<div className={`input input-${2}`} onClick={(e) => draw(e, 2)}></div>}
            {<div className={`input input-${3}`} onClick={(e) => draw(e, 3)}></div>}
            {<div className={`input input-${4}`} onClick={(e) => draw(e, 4)}></div>}
            {<div className={`input input-${5}`} onClick={(e) => draw(e, 5)}></div>}
            {<div className={`input input-${6}`} onClick={(e) => draw(e, 6)}></div>}
            {<div className={`input input-${7}`} onClick={(e) => draw(e, 7)}></div>}
            {<div className={`input input-${8}`} onClick={(e) => draw(e, 8)}></div>}
        </div>
    );
}

export default Board;