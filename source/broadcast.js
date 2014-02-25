'use strict';

var attach, init, broadcast, broadcastTo, Room, allSockets;


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
