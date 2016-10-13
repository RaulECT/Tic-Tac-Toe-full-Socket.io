$( document ).ready(function() {
  $( ".board" ).hide();
  $( ".error" ).hide();
  $( ".players" ).hide();
  $( ".invalid-move" ).hide();

  var socket = io.connect();
  var buttonPlay = $( "#btn" );

  var userNickname = $( "#player-nickname" );
  var secondPlayer = '';
  var secondPlayerId = '';
  var opcion = '';
  var isMyTurn = false;
  var board = Board;

  buttonPlay.on( "click", function() {
    socket.emit( 'new user', userNickname.val(), function( data ) {
      if ( data ) {
        $( ".player-login" ).hide();
        $( ".player" ).text( userNickname.val() );
        $( ".players" ).show();
        $( "#board" ).show();
      }else {
        $( ".error" ).show();
      }
    });

    socket.on( 'player found', function( data ) {
      secondPlayer = data.user;
      secondPlayerId = data.id;
      console.log( secondPlayer );
      $( ".second-player" ).text( data.user );
      opcion = "X";
      isMyTurn = true;
      console.log( opcion );
      socket.emit( 'notify player', {id: secondPlayerId, user:userNickname.val()} );
    });

    socket.on( 'connect player', function( data ){
      secondPlayer = data.user;
      secondPlayerId = data.id;
      console.log( secondPlayer );
      $( ".second-player" ).text( data.user );
      opcion = "O";
      console.log( opcion );
    });
  });

  $( ".square" ).on( "click", function() {
    if ( isMyTurn ) {

      $( ".invalid-move" ).hide();
      var move = $( this );

      var validMove = move.text() != 'X' && move.text() != 'O';

      if ( validMove ) {
        //move.text( opcion);
        board.makeMove( move, opcion );
        var selectedCell = move.attr( "id" );
        var type = opcion;
        socket.emit( 'move', {id:secondPlayerId, move: selectedCell, type:type} );
        isMyTurn = false;
        board.verifyResults();
      }else{
        $(".invalid-move").text("Invalid Move");
        $(".invalid-move").show();
      }


    }else{
      $( ".invalid-move" ).show();
    }

  });

  socket.on( 'recive move', function( data ){
    $( ".invalid-move" ).hide();
    isMyTurn = true;
    console.log( data );

    var secondPlayerMove = $( "#"+data.move );
    var option = data.type;

    board.makeMove( secondPlayerMove, option );
  } );

  socket.on( 'notify no winners', function( data ) {
    notifyNoWinners();
  } );





});

var notifyNoWinners = function() {
  $( '.result' ).text( 'No winners :D' );
}

var Board = new function() {

  var positions = [ "1", "2", "3", "4", "5", "6", "7", "8", "9" ];

  this.makeMove = function( move, option ) {
    move.text( option );

    var selectedCell = move.attr( "id" );
    var position = selectedCell.substr( selectedCell.length - 1 );
    positions.splice( positions.indexOf( position ), 1);

    console.log( positions.length );
  };

  this.verifyResults = function() {
    if ( positions.length == 0 ) {
      notifyNoWinners();
    }
    }
  };
