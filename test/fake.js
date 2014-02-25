'use strict';

var Room, Namespace, Broadcast, newSocket, emitFn;

Broadcast = require('../source/broadcast');
Room = require('../source/room');
Namespace = require('../source/namespace');

emitFn = function () {};

newSocket = function () {
  var socket = {

    id: ++newSocket.id,

    emit: function () {
      emitFn.apply(this, arguments);
    },

    namespace: function (name) {
      return new Namespace(name, this);
    }
  };

  Broadcast.attach(socket);
  Room.get('all').join(socket);

  return socket;
};

newSocket.listen = function (fn) {
  emitFn = fn;
};

newSocket.id = 0;

module.exports = newSocket;
