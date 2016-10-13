class Board {

  constuctor() {
    this.positions = [ "1", "2", "3", "4", "5", "6", "7", "8", "9" ];
  }

  static makeMove( move, opcion ) {
    move.text( opcion );

    var selectedCell = move.attr( "id" );
    var position = selectedCell.substr( selectedCell.length - 1 );
    positions.splice( positions.indexOf( position ), 1 );
  }
}
