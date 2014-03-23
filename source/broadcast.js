'use strict';

// delayed dependencies
var Room, allSockets;


/*
 * Attach
 *
 * - self (object) : the sender
 * - obj (object) : what to add the methods to
 * - [name] (string) : optional name for methods
 */

var attach = function attach (self, obj, name) {
  name = name || 'broadcast';
  obj = obj || self;
  obj[name] = broadcast(self);
  obj[name].to = broadcastTo(self);
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
  attach: attach,
  init: init
};
