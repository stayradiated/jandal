(function () {

  'use strict';

  var broadcast, Room, allSockets;

  /*
   * Broadcast
   *
   * - event (string)
   * - args... (mixed)
   */

  broadcast = function (event) {
    var args;

    args = Array.prototype.slice(arguments);
    args.unshift(this);
    allSockets.broadcast.apply(allSockets, args);
  };


  /*
   * Broadcast.to
   *
   * - room (string)
   */

  broadcast.to = function (room) {
    return Room.get(room);
  };

  broadcast.init = function (_room) {
    Room = _room;
    allSockets = Room.get('all');
    delete broadcast.init;
  };


  module.exports = broadcast;

}());
