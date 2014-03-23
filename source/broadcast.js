'use strict';

// delayed dependencies
var Room, allSockets;


/*
 * bind
 *
 * - self (object) : the sender
 * - obj (object) : what to add the methods to
 * - [name] (string) : optional name for methods
 */

var bind = function bind (self) {
  var obj = broadcast(self);
  obj.to = broadcastTo(self);
  return obj;
};

var detach = function (self, obj, name) {
};

/*
 * Broadcast
 *
 * - event (string)
 * - args... (mixed)
 */

var broadcast = function broadcast (self) {
  return function broadcastClosure (event, arg1, arg2, arg3) {
    allSockets.broadcast(self.id, event, arg1, arg2, arg3);
  };
};


/*
 * Broadcast.to
 *
 * - room (string)
 */

var broadcastTo = function broadcastTo (self) {
  return function broadcastToClosure (room) {
    room = Room.get(room);
    return {
      emit: function broadcastToEmit (event, arg1, arg2, arg3) {
        room.broadcast(self.id, event, arg1, arg2, arg3);
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

var init = function init (_room) {
  Room = _room;
  allSockets = Room.get('all');
  return module.exports;
};


module.exports = {
  bind: bind,
  init: init
};
