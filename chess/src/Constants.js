
export const n = 8;

export const nArr = Array(n).fill();

export const nnArr = Array(n*n).fill();

export const TYPES = {
    pawn: '♟︎',
    knight: '♞',
    bishop: '♝',
    rook: '♜',
    queen: '♛',
    king: '♚'
}

export const COLORS = {
    white: true,
    black: false
}

export const emptyBoardState = () => {
    return {
        turn: COLORS.white, // T=White / F=Black
        turnNum: 0,
        data: nnArr.map(_ => null),
        pieces: {
            white: [],
            black: []
        },
        selected: -1,
        highlighted: [],
        history: [],
        gameOver: null,
    }
};

export const knightMoves = [[1, 2], [2, 1], [2, -1], [1, -2], [-1, -2], [-2, -1], [-2, 1], [-1, 2]];

export const bishopMoves = [[1, 1], [1, -1], [-1, -1], [-1, 1]];

export const rookMoves = [[0, 1], [1, 0], [0, -1], [-1, 0]];

export const defaultSetup = [TYPES.rook, TYPES.knight, TYPES.bishop, TYPES.queen, TYPES.king, TYPES.bishop, TYPES.knight, TYPES.rook, 
        ...nArr.map(x => TYPES.pawn)];