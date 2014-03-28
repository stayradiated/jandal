'use strict';

var Path = require('path');
var socketPath = Path.dirname(__dirname);

for (var path in require.cache) {
  if (! require.cache.hasOwnProperty(path)) continue;
  var reqMod = require.cache[path];
  if (! reqMod.filename.match(socketPath)) continue;
  delete require.cache[path];
}

var inherits     = require('../source/util').inherits;
var EventEmitter = require('events').EventEmitter;
var Jandal = require('../index');
var Debugger = require('../../Jandal-Debugger/index');

// Jandal handler based on an event emitter
var handler = {
  identify: function sandalIdentify (socket) {
    return socket.id;
  },
  write: function sandalWrite (socket, message) {
    Debugger.emit(socket.id, message);
    return socket.emit('write', message);
  },
  onread: function sandalOnRead (socket, fn) {
    return socket.on('read', fn);
  },
  onclose: function sandalOnClose (socket, fn) {
    return socket.on('close', fn);
  },
  onerror: function sandalOnError (socket, fn) {
    return socket.on('error', fn);
  },
  onopen: function sandalOnOpen (socket, fn) {
    return process.nextTick(fn);
  },
  release: function sandalRelease (socket) {
    socket.removeAllListeners('read');
    socket.removeAllListeners('close');
    socket.removeAllListeners('error');
  }
};



/*
 * EVENTS:
 *
 * - read : a message is being sent to the socket
 * - write : a message is being sent from the socket
 * - close : the socket is being closed
 *
 */

var Socket = function Socket () {
  this.end   = this.end.bind(this);
  this.close = this.close.bind(this);
  this.pipe  = this.pipe.bind(this);

  Socket.__super__.apply(this, arguments);

  this.open = true;
};

inherits(Socket, EventEmitter);

Socket.prototype.pipe = function pipe (socket) {
  this.on('close', function pipeClose (status, message) {
    return socket.close(status, message);
  });
  this.on('write', function pipeWrite (message) {
    return socket.emit('read', message);
  });
  return socket;
};

Socket.prototype.end = function end () {
  return this.close();
};

Socket.prototype.close = function close (status, message) {
  if (!this.open) {
    return;
  }
  this.open = false;
  return this.emit('close', status, message);
};


var id = 0;

/**
 * Sandal
 * 
 * For when you need to test Jandal
 */

var Sandal = function Sandal () {
  Sandal.__super__.call(this);

  this.serverSocket = new Socket();
  this.serverSocket.id = 'server_' + id++;

  this.clientSocket = new Socket();
  this.clientSocket.id = 'client_' + id++;

  this.serverSocket.pipe(this.clientSocket);
  this.clientSocket.pipe(this.serverSocket);

  this.connect(this.clientSocket, handler);
  this.on('socket.close', this.end.bind(this));
};

inherits(Sandal, Jandal);

Sandal.handler = handler;

Sandal.prototype.end = function end () {
  this.clientSocket.end();
  this.serverSocket.end();
  this.clientSocket.removeAllListeners();
  return this.serverSocket.removeAllListeners();
};

module.exports = Sandal;

