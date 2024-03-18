// Importing the required components
import Board from './Board';
import Info from './Info';
import { n } from './Constants';

// Import the CSS file
import './css/app.css';

// Import the useState hook
import { useState } from 'react';

function App() {
    return (
        <div className="App">
            <Board />
        </div>
    );
}

export default App;