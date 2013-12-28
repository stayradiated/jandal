(function () {

  'use strict';

  var attach, broadcast, broadcastTo, Room, allSockets;


  /*
   * Attach
   */

  attach = function (obj, self, name) {
    name = name || 'broadcast';
    self = self || obj;
    self[name] = broadcast(obj);
    self[name].to = broadcastTo(obj);
  };

  /*
   * Broadcast
   *
   * - event (string)
   * - args... (mixed)
   */

  broadcast = function (self) {
    return function (event) {
      var args = Array.prototype.slice.call(arguments);
      args.unshift(self);
      allSockets.broadcast.apply(allSockets, args);
    };
  };


  /*
   * Broadcast.to
   *
   * - room (string)
   */

  broadcastTo = function (self) {
    return function (room) {
      room = Room.get(room);
      return {
        emit: function (event) {
          var args = Array.prototype.slice.call(arguments);
          args.unshift(self);
          room.broadcast.apply(room, args);
        }
      };
    };
  };


  /*
   * (Private) Init
   * Loads the room dependency
   * Can only be run once.
   *
   * - room (Room) : room class
   */

  attach.init = function (_room) {
    Room = _room;
    allSockets = Room.get('all');
  };


  module.exports = attach;

}());
