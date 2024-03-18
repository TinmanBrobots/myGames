import React from 'react'
import ReactDOM from 'render-dom'

function Game() {

    const game = newTicTacToeGrid()

    return <Grid grid={game}/>
}

function generateGrid(rows, cols, mapper) {
    return Array(rows).map(() => Array(cols).map(mapper))
}

function Grid({ grid }) {
    <div style={{ display: 'inline-block' }}>
        <div 
            style={{
                backgroundColor: '#000',
                display: 'grid',
                gridTemplateRows: `repeat(${grid.length}, 1fr)`,
                gridTemplateColumns: `repeat(${grid[0].length}, 1fr)`,
                gridGap: 2,
            }}
        >
            {grid.map((row, rowIdx) => 
                row.map((col, colIdx) => 
                    <Cell key={`${rowIdx},${colIdx}`} cell={cell}/>
                )
            )}
        </div>
    </div>
}

const cellStyle = {
    backgroundColor: '#FFF',
    height: 75,
    width: 75,
}

function Cell({ cell }) {
    return <div style={cellStyle}>{cell}</div>
}

const newTicTacToeGrid = () => generateGrid(3, 3, () => null)


ReactDOM.render(<Game/>, document.getElementById('root'))