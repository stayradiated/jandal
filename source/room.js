(function () {

  'use strict';

  var Room, Namespace;


  /*
   * Dependencies
   */

  Namespace = require('./namespace');


  /*
   * Room Constructor
   */

  Room = function (id) {
    this.id = id;
    this.sockets = [];
    this.namespaces = {};
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

  Room.get = function (id) {
    var room = Room.rooms[id];
    if (! room) {
      room = Room.rooms[id] = new Room(id);
    }
    return room;
  };


  /*
   * (Static) Remove
   * Remove an entire room
   *
   * - id (string)
   */

  Room.remove = function (id) {
    delete Room.rooms[id];
  };


  /*
   * (Static) Flush
   * Remove all the rooms
   */

  Room.flush = function () {
    for (var id in Room.rooms) {
      Room.remove(id);
    }
  };


  /*
   * Join
   * Add a socket to the room
   *
   * - socket (socket)
   */

  Room.prototype.join = function (socket) {
    if (! (socket in this.sockets)) {
      this.sockets.push(socket);
    }
  };


  /*
   * Leave
   * Remove a socket from the room
   *
   * - socket (socket)
   */

  Room.prototype.leave = function (socket) {
    var index = this.sockets.indexOf(socket);
    if (index > -1) {
      this.sockets.splice(index, 1);
    }
  };


  /*
   * Length
   * The number of sockets in the room
   *
   * > int
   */

  Room.prototype.length = function () {
    return this.sockets.length;
  };


  /*
   * Emit
   * Emit an event to everyone in the room
   *
   * - event (string)
   * - args... (mixed)
   */

  Room.prototype.emit = function () {
    var i, len, socket;
    len = this.sockets.length;
    for (i = 0; i < len; i++) {
      socket = this.sockets[i];
      socket.emit.apply(socket, arguments);
    }
  };


  /*
   * Broadcast
   * Emit events to everyone but the sender
   *
   * - sender (socket)
   * - event (string)
   * - args... (mixed)
   */

  Room.prototype.broadcast = function (sender) {
    var i, len, socket, args;
    len = this.sockets.length;
    args = Array.prototype.slice.call(arguments, 1);
    for (i = 0; i < len; i++) {
      socket = this.sockets[i];
      if (socket !== sender) {
        socket.emit.apply(socket, args);
      }
    }
  };


  /*
   * Namespace
   * Get (and maybe create) a namespace for this room
   *
   * - name (string) : name of the namespace
   * > namespace
   */

  Room.prototype.namespace = function (name) {
    var namespace = this.namespaces[name];
    if (! namespace) {
      namespace = this.namespaces[name] = new Namespace(name, this);
    }
    return namespace;
  };


  /*
   * In
   * Get another room of sockets
   * So you can do `Jandal.sockets.in('room').emit('hi');`
   *
   * - id (int) : id of the room
   * > room
   */

  Room.prototype.in = function (id) {
    return Room.get(id);
  };


  /*
   * Contains
   * Checks if a socket is already in a room
   *
   * - socket (socket)
   * > boolean
   */

  Room.prototype.contains = function (socket) {
    var i, len;
    len = this.sockets.length;
    for (i = 0; i < len; i++) {
      if (this.sockets[i] === socket) {
        return true;
      }
    }
    return false;
  };


  /*
   * Destroy
   * Remove the room
   */

  Room.prototype.destroy = function () {
    Room.remove(this.id);
  };


  module.exports = Room;

}());
