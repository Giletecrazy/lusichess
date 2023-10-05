var express = require('express');
var app = express();

const { Chess } = require('chess.js')

app.use(express.static('public'));
var http = require('http').Server(app);
var port = process.env.PORT || 3000;

/*
 Serve the chess client
*/
app.get('/', function (req, res) {
  res.sendFile(__dirname + '/public/index.html');
});

http.listen(port, function () {
  console.log('listening on port: ' + port);
});

var io = require('socket.io')(http);


/*
 Create a dictionary of clients, such that each
 client can play agains the "AI".
*/
var clients = new Object();

io.on('connection', function (socket) {
  // New client, new game!
  clients[socket.id] = new Chess();

  // Received a move from a client
  socket.on('move', function (msg) {
    clients[socket.id].move(msg)  // "Play" the move in our chess rule engine
    /*
      Random chess moves
      Get a list of all allowed moves and choose one randomly.
      Send it with verbose mode as it is compatible with the chessboardjs engine.
    */
    if (clients[socket.id].isGameOver()) {
      if (clients[socket.id].isCheckmate()) {
        socket.emit('end', 'Checkmate');  
      } else if (clients[socket.id].isDraw()) {
        socket.emit('end', 'Draw');  
      } else if (clients[socket.id].isInsufficientMaterial()) {
        socket.emit('end', 'InsufficientMaterial');  
      } else if (clients[socket.id].isStalemate()) {
        socket.emit('end', 'StaleMate');  
      } else if (clients[socket.id].isThreefoldRepetition()) {
        socket.emit('end', 'ThreefoldRepetition');  
      }
    } else {
      const moves = clients[socket.id].moves({ verbose: true })
      const move = moves[Math.floor(Math.random() * moves.length)]
      socket.emit('move', move);
      clients[socket.id].move(move)  // Also apply this move to our chess rule engine
    }
  });
});
