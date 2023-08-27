import { n, nArr, nnArr } from './Constants';

export function toAbs(...position) {
    if (!position) throw new Error("Position undefined when converting to abs");
    const l = position.length;
    if (l != 1 && l != 2) throw new Error(`Position must be 'abs' or 'row, col' (not length ${l})`);
    return (l === 1) ? position[0] : coordToAbs(...position);
}

export function toCoord(...position) {
    if (!position) throw new Error("Position undefined when converting to coord");
    const l = position.length;
    if (l != 1 && l != 2) throw new Error(`Position must be 'abs' or 'row, col' (not length ${l})`);
    return (l === 1) ? absToCoord(position[0]) : position;
}

function coordToAbs(row, col) {
    return row * n + col;
}

function absToCoord(abs) {
    return [Math.floor(abs / n), abs % n];
}

export function onBoard(row, col) {
    return (0 <= row) && (row < n) && (0 <= col) && (col < n);
}