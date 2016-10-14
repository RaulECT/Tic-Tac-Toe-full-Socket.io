var express = require('express');
var http = require('http');
var socket = require('socket.io');

var app = express();
var server = http.createServer(app);
var users = [];
var usersWaiting = [];
var usersData = [];

app.use("/css", express.static(__dirname + '/css'));
app.use("/js", express.static(__dirname + '/js'));

server.listen(3000, function(){
  console.log("Running on port 3000");
})

var io = socket.listen(server);

app.get('/', function(call, answer){
    answer.sendFile(__dirname + '/index.html');
});

io.on('connection', function(socket){
  socket.on('new user', function(user, callback){

    if (users.indexOf(user) != -1) {
      callback(false);
    }else {
      callback(true);

      socket.user = user;
      users.push(user);

      console.log("User: " + socket.user + " ID: " +socket.id);

      if (usersWaiting.length == 0) {
        usersWaiting.push(socket.id);
        usersData.push({id:socket.id, user: user});
      }else {
        var secondPlayer = usersWaiting.pop();
        var secondPlayerData = usersData.pop();

        socket.broadcast.to(secondPlayer).emit('player found', {id:socket.id, user:user});
        socket.broadcast.to(socket.id).emit('player found', secondPlayerData);
      }
    }
  });

  socket.on('notify player', function(data){
    socket.broadcast.to(data.id).emit('connect player',{id:socket.id, user:data.user});
  });

  socket.on('move', function(data){
    console.log("Move: "+data.move + "  for: "+data.id + " type: " + data.type);
    socket.broadcast.to(data.id).emit('recive move', {move:data.move, type:data.type});
  });

  socket.on('disconnect', function(data){
    users.splice(users.indexOf(socket.user),1);
  });

  socket.on( 'no winners', function( data, callback ) {
    callback( true );
    socket.broadcast.to( data.id ).emit( 'notify no winners', {id:data.id} );
  } );

  socket.on( 'first player won', function( data, callback ) {
    callback( true );
    socket.broadcast.to( data.id ).emit( 'you lose', {id:data.id} );
  } );

  socket.on( 'second player won', function( data, callback ) {
    callback( true );
    socket.broadcast.to( data.id ).emit( 'you lose', {id:data.id} );
  } );


});
