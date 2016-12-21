// Setup basic express server
var express = require('express');
var app = express();
var fs = require('fs');
var server = require('http').createServer(app);
var io = require('socket.io')(server);
var port = process.env.PORT || 3000;

server.listen(port, function () {
  console.log('Server listening at port %d', port);
  fs.writeFile(__dirname + '/start.log', 'started'); 
});

// Routing
app.use(express.static(__dirname));

// Entire gameCollection Object holds all games and info

var gameCollection =  new function() {

  this.totalGameCount = 0,
  this.gameList = []

};



// Chatroom

var numUsers = 0;

io.on('connection', function (socket) {
  var addedUser = false;

  // when the client emits 'new message', this listens and executes
  socket.on('new message', function (data) {
    // we tell the client to execute 'new message'
    socket.broadcast.emit('new message', {
      username: socket.username,
      message: data
    });
  });

  // when the client emits 'add user', this listens and executes
  socket.on('add user', function (username) {
    if (addedUser) return;

    // we store the username in the socket session for this client
    socket.username = username;
    ++numUsers;
    addedUser = true;
    socket.emit('login', {
      numUsers: numUsers
    });
    // echo globally (all clients) that a person has connected
    socket.broadcast.emit('user joined', {
      username: socket.username,
      numUsers: numUsers
    });
  });

  // when the client emits 'typing', we broadcast it to others
  socket.on('typing', function () {
    socket.broadcast.emit('typing', {
      username: socket.username
    });
  });

  // when the client emits 'stop typing', we broadcast it to others
  socket.on('stop typing', function () {
    socket.broadcast.emit('stop typing', {
      username: socket.username
    });
  });

  // when the user disconnects.. perform this
  socket.on('disconnect', function () {
    if (addedUser) {
      --numUsers;

      // echo globally that this client has left
      socket.broadcast.emit('user left', {
        username: socket.username,
        numUsers: numUsers
      });
    }
  });

  //when the client  requests to make a Game
  socket.on('makeGame', function () {

     console.log(JSON.stringify(gameCollection.gameList));

 
    var noGamesFound = true;
   

  for(var i = 0; i < gameCollection.totalGameCount; i++){
  var tempName = gameCollection.gameList[i]['gameObject']['playerOne'];
  if (tempName == socket.username){
  noGamesFound = false;
  console.log("This User already has a Game!");
  socket.emit('alreadyJoined', {
  gameId: gameCollection.gameList[i]['gameObject']['id']});

   }

  }

  if (noGamesFound == true) {

   var gameObject = {};
   gameObject.id = (Math.random()+1).toString(36).slice(2, 18);
   gameObject.playerOne = socket.username;
   gameCollection.totalGameCount ++;
   gameCollection.gameList.push({gameObject});

   console.log("Game Created by "+ socket.username + " w/ " + gameObject.id);
  io.emit('gameCreated', {
    username: socket.username,
    gameId: gameObject.id
  });



    
  }



  });


  socket.on('joinGame', function (){

    //Check to see if user exists


  })

});




//Join a Game
  function joinGame(username, game) {


  if (game.player2 !== null) {
    game.player2 = username;
  } 
  else {
    alert("Game "+game.id+ " Already Has Max Players" )
  }

}

