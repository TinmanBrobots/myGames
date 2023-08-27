// Importing the required components
import Board from './Board';
import Info from './Info';
import { n } from './Constants';

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
            <Board n={n} reset={reset} setReset={setReset} winner={winner} setWinner={setWinner} />
        </div>
    );
}

export default App;