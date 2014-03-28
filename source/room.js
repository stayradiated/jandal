'use strict';

/*
 * Dependencies
 */

var Namespace = require('./namespace');


/*
 * Room Constructor
 */

var Room = function Room (id) {
  this.id = id;
  this.sockets = [];
  this._namespaces = {};
};


/*
 * (Static) Rooms
 * Holds all the rooms in existance
 */

Room.rooms = {};


/*
 * (Static) Get
 * Get or create a room
 *
 * - id (string)
 * > room
 */

Room.get = function get (id) {
  var room = Room.rooms[id];
  if (! room) {
    room = Room.rooms[id] = new Room(id);
  }
  return room;
};


/*
 * (Static) Flush
 * Remove all the rooms
 */

Room.flush = function flush () {
  for (var id in Room.rooms) {
    Room.get(id).empty();
    delete Room.rooms[id];
  }
};


/*
 * (Private) Join
 * Add a socket to the room
 *
 * - socket (socket)
 */

Room.prototype._join = function _join (socket) {
  if (this.sockets.indexOf(socket) < 0) {
    this.sockets.push(socket);
  }
  return this;
};


/*
 * (Private) Leave
 * Remove a socket from the room
 *
 * - socket (socket)
 */

Room.prototype._leave = function _leave (socket) {
  var index = this.sockets.indexOf(socket);
  if (index >= 0) {
    this.sockets.splice(index, 1);
  }
  return this;
};


/*
 * In
 * Get another room of sockets
 * So you can do `Jandal.sockets.in('room').emit('hi');`
 *
 * - id (int) : id of the room
 * > room
 */

Room.prototype.in = function in_ (id) {
  return Room.get(id);
};


/*
 * Length
 * The number of sockets in the room
 *
 * > int
 */

Room.prototype.length = function length () {
  return this.sockets.length;
};


/*
 * Emit
 * Emit an event to everyone in the room
 *
 * - event (string)
 * - args... (mixed)
 */

Room.prototype.emit = function emit (event, arg1, arg2, arg3) {
  for (var i = 0, len = this.sockets.length; i < len; i++) {
    this.sockets[i].emit(event, arg1, arg2, arg3);
  }
  return this;
};


/*
 * Broadcast
 * Emit events to everyone but the sender
 *
 * - sender (socket)
 * - event (string)
 * - args... (mixed)
 */

Room.prototype.broadcast = function broadcast (sender, event, arg1, arg2, arg3) {
  for (var i = 0, len = this.sockets.length; i < len; i++) {
    var socket = this.sockets[i];
    if (socket.id !== sender) {
      socket.emit(event, arg1, arg2, arg3);
    }
  }
  return this;
};


/*
 * Namespace
 * Get (and maybe create) a namespace for this room
 *
 * - name (string) : name of the namespace
 * > namespace
 */

Room.prototype.namespace = function namespace (name) {
  var ns = this._namespaces[name];
  ns = ns ? ns : this._namespaces[name] = new Namespace(name, this);
  return ns;
};


/*
 * Contains
 * Checks if a socket is already in a room
 *
 * - socket (socket)
 * > boolean
 */

Room.prototype.contains = function contains (socket) {
  for (var i = 0, len = this.sockets.length; i < len; i++) {
    if (this.sockets[i] === socket) {
      return true;
    }
  }
  return false;
};


/*
 * Destroy
 * Remove all sockets from a room
 */

Room.prototype.empty = function empty () {
  for (var i = this.sockets.length - 1; i >= 0; i--) {
    this._leave(this.sockets[i]);
  }
};


/*
 * Release
 * Empty the room and delete it from Room.rooms
 */

Room.prototype.release = function () {
  this.empty();
  delete Room.rooms[this.id];
};




module.exports = Room;
