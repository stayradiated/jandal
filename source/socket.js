'use strict';

var Socket, Namespace, Callbacks, Room, Broadcast, Message,
    EventEmitter, inherits, handle;

/*
 * Dependencies
 */

EventEmitter = require('events').EventEmitter;
Namespace    = require('./namespace');
Callbacks    = require('./callbacks');
Room         = require('./room');
inherits     = require('./util').inherits;
Broadcast    = require('./broadcast').init(Room);
handle       = require('./handle');
Message      = require('./message');

/*
 * Socket Constructor
 *
 * - [socket] (object) : socket to send and receive messages over
 * - [handle] (string|object) : socket interface
 */

Socket = function (socket, handle) {
  Socket.super_.call(this);

  // public properties
  this.rooms = [];

  // private properties
  this._namespaces = {};
  this._callbacks = new Callbacks(this.namespace('socket'));
  this._message = new Message(this._callbacks);

  this.join('all');
  Broadcast.attach(this);

  // Set up socket and handle
  if (socket) this.connect(socket, handle);

};


/*
 * Inherit from EventEmitter
 */

inherits(Socket, EventEmitter);
Socket.prototype._emit = EventEmitter.prototype.emit;


/*
 * (Static) All
 */

Socket.all = Room.get('all');


/*
 * (Static) In
 */

Socket.in = Room.get;


/*
 * (Private) Process
 * Processes messages received on the socket
 *
 * - data (string)
 */

Socket.prototype._process = function (data) {
  var message, details, namespace, ns, callback, event, arg1, arg2, arg3;

  message = this._message.parse(data);
  details = Namespace.parse(message.event);

  arg1 = message.arg1;
  arg2 = message.arg2;
  arg3 = message.arg3;

  event = details.event;
  namespace = details.namespace;
  ns = this._namespaces[namespace];

  if (namespace && ns) {
    ns._emit(event, arg1, arg2, arg3);
  }

  this._emit(message.event, arg1, arg2, arg3);
};



/*
 * (Private) Handle With
 *
 * - name (string|object) : the name of a handler, or a handler
 */

Socket.prototype._handleWith = function (name) {
  this._handle = handle(name);
};


/*
 * Connect
 * Connect to a socket
 *
 * - socket (Object)
 */

Socket.prototype.connect = function (socket, handle) {
  var self = this;

  if (handle) this._handleWith(handle);

  this.socket = socket;
  this.id = this._handle.identify(socket);

  this._handle.onread(this.socket, function (message) {
    self._process(message);
  });

  this._handle.onopen(this.socket, function (event) {
    self._emit('socket.open', event);
  });

  this._handle.onerror(this.socket, function (event) {
    self._emit('socket.error', event);
  });

  this._handle.onclose(this.socket, function (status, message) {
    self.release();
    self._emit('socket.close', status, message);
  });
};


/*
 * Namespace
 * If the namespace already exists it will be used instead
 *
 * - name (string)
 * > namespace
 */

Socket.prototype.namespace = function (name) {
  var namespace = this._namespaces[name];
  if (! namespace) {
    namespace = this._namespaces[name] = new Namespace(name, this);
  }
  return namespace;
};



/*
 * Send a message through the socket
 *
 * - event (string)
 * - args... (mixed) : any data you want to send
 */

Socket.prototype.emit = function (event, arg1, arg2, arg3) {
  var message;

  if (event === 'newListener' || event === 'removeListener') {
    return this._emit(event, arg1, arg2, arg3);
  }

  message = this._message.serialize(event, arg1, arg2, arg3);

  this._handle.write(this.socket, message);
};




/*
 * Join
 *
 * - room (string)
 */

Socket.prototype.join = function (room) {
  var index = this.rooms.indexOf(room);
  if (index < 0) {
    this.rooms.push(room);
    room = Room.get(room);
    room._join(this);
  }
};


/*
 * Leave
 *
 * - room (string)
 */

Socket.prototype.leave = function (room) {
  var index = this.rooms.indexOf(room);
  if (index > -1) {
    this.rooms.splice(index, 1);
    room = Room.get(room);
    room._leave(this);
  }
};


/*
 * Room
 *
 * - name (string)
 */

Socket.prototype.room = Room.get;


/*
 * Release
 */

Socket.prototype.release = function () {
  var i, len;
  len = this.rooms.length;
  for (i = len - 1; i >= 0; i--) {
    this.leave(this.rooms[i]);
  }
};


module.exports = Socket;
