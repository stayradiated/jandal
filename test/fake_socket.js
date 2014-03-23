'use strict';


var Broadcast = require('../source/broadcast');
var Room = require('../source/room');
var Namespace = require('../source/namespace');

var lastMessage = {};
var emitFn;

var Socket = function () {
  this.id = ++Socket.id;
  this.broadcast = Broadcast.bind(this);
  Room.get('all')._join(this);
};

Socket.prototype.emit = function (event, a, b, c) {
  lastMessage[this.id] = [event, a, b, c];
  emitFn.apply(this, arguments);
};

Socket.prototype.namespace = function (name) {
  return new Namespace(name, this);
};

Socket.prototype.last = function () {
  return lastMessage[this.id];
};

Socket.prototype.join = function (room) {
  Room.get(room)._join(this);
};

Socket.prototype.leave = function (room) {
  Room.get(room)._leave(this);
};

Socket.id = 0;

Socket.listen = function (fn) {
  emitFn = fn;
};

Socket.reset = function () {
  lastMessage = {};
  emitFn = function () {};
  Room.flush();
  Broadcast.init(Room);
};

Socket.reset();

module.exports = Socket;
