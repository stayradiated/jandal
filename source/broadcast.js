'use strict';

var attach, init, broadcast, broadcastTo, Room, allSockets;


/*
 * Attach
 *
 * - self (object) : the sender
 * - obj (object) : what to add the methods to
 * - [name] (string) : optional name for methods
 */

attach = function (self, obj, name) {
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

broadcast = function (self) {
  return function (event, arg1, arg2, arg3) {
    allSockets.broadcast(self.id, event, arg1, arg2, arg3);
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
      emit: function (event, arg1, arg2, arg3) {
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

init = function (_room) {
  Room = _room;
  allSockets = Room.get('all');
  return module.exports;
};


module.exports = {
  attach: attach,
  init: init
};
