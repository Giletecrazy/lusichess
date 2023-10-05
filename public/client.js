import { Chess } from './lib/chess.js'

var board;
var game;
var socket = io();

/*
  Initialize a new game
  Improvements: 
  - Allow to play with black or white
  - Allow for a pre-defined games to be loaded

*/
var initGame = () => {

    // Only allow to move white parts
    const onDragStart = (source, piece, position, orientation) => {  
        return (piece.search(/^b/) === -1)
    }

    var cfg = {
        draggable: true,
        position: 'start',
        onDragStart: onDragStart,
        onDrop: handleMove,
    };

    board = new ChessBoard('gameBoard', cfg);
    game = new Chess();
}

/*
  Handle a move and send it to the server if it is valid
*/
var handleMove = (source, target) => {
    var move = game.move({from: source, to: target});
    if (move === null)  return 'snapback';
    socket.emit('move', move);
}

/*
  Receive a move from the server
*/
socket.on('move', (msg) => {
    game.move(msg);
    board.position(game.fen()); 
});

socket.on('end', (msg) => {
    alert(msg);
});

/*
  Start if all is loaded
*/
window.addEventListener('load', () => initGame());
