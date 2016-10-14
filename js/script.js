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
        Board.makeMove( move, opcion );
        var selectedCell = move.attr( "id" );
        var type = opcion;
        socket.emit( 'move', {id:secondPlayerId, move: selectedCell, type:type} );
        isMyTurn = false;
        Board.verifyResults();
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

    Board.makeMove( secondPlayerMove, option );
  } );

  socket.on( 'notify no winners', function( data ) {
    notifyNoWinners();
  } );

  socket.on( 'you lose', function( data ) {
    $( '.result' ).text( 'You lost D:' )
  } );

  var notifyFirstPlayerWon = function() {

    socket.emit( 'first player won', {id:secondPlayerId}, function( data ) {
      $( '.result' ).text( 'You won :D' )
    } );

  }

  var notifySecondPlayerWon = function() {
    socket.emit( 'second player won', {id:secondPlayer}, function() {
      $( '.result' ).text( 'You won :D' )
    } );
  }

  var newGame = function() {
    $( ".result" ).text( '' );

    Board.restartGame();

    if ( opcion  == 'X') {
      isMyTurn = true;
    }else {
      isMyTurn = false;
    }

    $( '.square' ).text( " " );
  }

  var notifyNoWinners = function() {
    $( '.result' ).text( 'No winners :D' );
    setTimeout( newGame, 1500 );
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

  this.restartGame = function() {
    positions = [ "1", "2", "3", "4", "5", "6", "7", "8", "9" ];
  }

  this.verifyResults = function() {
    if ( positions.length == 0 ) {
      //notifyNoWinners();
      socket.emit( 'no winners', {id:secondPlayerId}, function( data ) {
        notifyNoWinners();
      } );
    }else if ( $( "#celda1, #celda2, #celda3" ).text()=="XXX" ) {
      $( "#celda1, #celda2, #celda3" ).addClass( "square-winner" );
      notifyFirstPlayerWon();

    }else if($("#celda4, #celda5, #celda6").text()=="XXX"){
      $("#celda4, #celda5, #celda6").addClass( 'square-winner' );
      notifyFirstPlayerWon();
    }
    else if($("#celda4, #celda5, #celda6").text()=="OOO"){
      $("#celda4, #celda5, #celda6").addClass( 'square-winner' );
      notifySecondPlayerWon();
    }
    else if($("#celda7, #celda8, #celda9").text()=="XXX"){
      $("#celda7, #celda8, #celda9").addClass( 'square-winner' );
      notifyFirstPlayerWon();
    }
    else if($("#celda7, #celda8, #celda9").text()=="OOO"){
      $("#celda7, #celda8, #celda9").addClass( 'square-winner' );
      notifySecondPlayerWon();
    }
    else if($("#celda1, #celda4, #celda7").text()=="XXX"){
      $("#celda1, #celda4, #celda7").addClass( 'square-winner' );
      notifyFirstPlayerWon();
    }
    else if($("#celda1, #celda4, #celda7").text()=="OOO"){
      $("#celda1, #celda4, #celda7").addClass( 'square-winner' );
      notifySecondPlayerWon();
    }
    else if($("#celda2, #celda5, #celda8").text()=="XXX"){
      $("#celda2, #celda5, #celda8").addClass( 'square-winner' );
      notifyFirstPlayerWon();
    }
    else if($("#celda2, #celda5, #celda8").text()=="OOO"){
      $("#celda2, #celda5, #celda8").addClass( 'square-winner' );
      notifySecondPlayerWon();
    }
    else if($("#celda3, #celda6, #celda9").text()=="XXX"){
      $("#celda3, #celda6, #celda9").addClass( 'square-winner' );
      notifyFirstPlayerWon();
    }
    else if($("#celda3, #celda6, #celda9").text()=="OOO"){
      $("#celda3, #celda6, #celda9").addClass( 'square-winner' );
      notifySecondPlayerWon();
    }
    else if($("#celda1, #celda5, #celda9").text()=="XXX"){
      $("#celda1, #celda5, #celda9").addClass( 'square-winner' );
      notifyFirstPlayerWon();
    }
    else if($("#celda1, #celda5, #celda9").text()=="OOO"){
      $("#celda1, #celda5, #celda9").addClass( 'square-winner' );
      notifySecondPlayerWon();
    }
    else if($("#celda3, #celda5, #celda7").text()=="XXX"){
      $("#celda3, #celda5, #celda7").addClass( 'square-winner' );
      notifyFirstPlayerWon();
    }
    else if($("#celda3, #celda5, #celda7").text()=="OOO"){
      $("#celda3, #celda5, #celda7").addClass( 'square-winner' );
      notifySecondPlayerWon();
    }
    }
  };

});
