// Importing the required components
import Board from './Board';
import Info from './Info';

// Import the CSS file
import './css/app.css';

// Import the useState hook
import { useState } from 'react';

function App() {
    const [reset, setReset] = useState(false); // indicates if game should be reset
    const [winner, setWinner] = useState(""); // indicates the current winner
    
    const resetBoard = () => {
        setReset(true);
    }

    return (
        <div className="App">
            <div className={`winner ${winner === "" ? "shrink" : ""}`}>
                <div className='winner-text'>{winner}</div>
                <button onClick={ () => resetBoard() }>
                    Reset Board
                </button>
            </div>
            <Board reset={reset} setReset={setReset} winner={winner} setWinner={setWinner} />
            <Info />
        </div>
    );
}

export default App;