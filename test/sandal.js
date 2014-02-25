'use strict';

var EventEmitter, Jandal, JandalC, Sandal, Socket, setup, inherits,

Jandal       = require('../source/jandal');
JandalC      = require('../client');
inherits     = require('../source/util').inherits;
EventEmitter = require('events').EventEmitter;


// Jandal handler based on an event emitter
setup = function() {
  var handler;

  handler = {
    identify: function (socket) {
      return socket.id;
    },
    write: function(socket, message) {
      return socket.emit('write', message);
    },
    onread: function(socket, fn) {
      return socket.on('read', fn);
    },
    onclose: function(socket, fn) {
      return socket.on('close', fn);
    },
    onerror: function(socket, fn) {
      return socket.on('error', fn);
    },
    onopen: function(socket, fn) {
      return process.nextTick(fn);
    }
  };

  Jandal.handle(handler);
  JandalC.handle(handler);

  return handler;
};



/*
 * EVENTS:
 *
 * - read : a message is being sent to the socket
 * - write : a message is being sent from the socket
 * - close : the socket is being closed
 *
 */

Socket = function () {
  this.end   = this.end.bind(this);
  this.close = this.close.bind(this);
  this.pipe  = this.pipe.bind(this);

  Socket.super_.apply(this, arguments);

  this.open = true;
};

inherits(Socket, EventEmitter);

Socket.prototype.pipe = function(socket) {
  this.on('close', function(status, message) {
    return socket.close(status, message);
  });
  this.on('write', function(message) {
    return socket.emit('read', message);
  });
  return socket;
};

Socket.prototype.end = function() {
  return this.close();
};

Socket.prototype.close = function(status, message) {
  if (!this.open) {
    return;
  }
  this.open = false;
  return this.emit('close', status, message);
};


/**
 * Sandal
 * 
 * For when you need to test Jandal
 */

Sandal = function() {
  var id;

  Sandal.super_.call(this);

  id = Math.floor(Math.random() * 1000);
  this.serverSocket = new Socket();
  this.serverSocket.id = 'server_' + id;
  this.clientSocket = new Socket();
  this.clientSocket.id = 'client_' + id;
  this.serverSocket.pipe(this.clientSocket);
  this.clientSocket.pipe(this.serverSocket);
  this.connect(this.clientSocket);
  this.on('socket.close', this.end.bind(this));
};

Sandal.setup = setup;
inherits(Sandal, Jandal);

Sandal.prototype.end = function() {
  this.clientSocket.end();
  this.serverSocket.end();
  this.clientSocket.removeAllListeners();
  return this.serverSocket.removeAllListeners();
};

module.exports = Sandal;

