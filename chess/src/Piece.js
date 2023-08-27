import './css/piece.css';

export class Piece {
    constructor(props) {
        this.myType = props.type;
        this.myColor = props.color;
        this.firstMove = -1;
        this.capturedPos = -1;
    }
}