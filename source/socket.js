'use strict';

/*
 * Dependencies
 */

var EventEmitter = require('events').EventEmitter;
var Namespace    = require('./namespace');
var Callbacks    = require('./callbacks');
var Room         = require('./room');
var inherits     = require('./util').inherits;
var Broadcast    = require('./broadcast').init(Room);
var handle       = require('./handle');
var Message      = require('./message');

/*
 * Socket Constructor
 *
 * - [socket] (object) : socket to send and receive messages over
 * - [handle] (string|object) : socket interface
 */

var Socket = function Socket (socket, handle) {
  Socket.__super__.call(this);

  // public properties
  this.rooms = [];
  this.broadcast = Broadcast.bind(this);

  // private properties
  this._namespaces = {};
  this._callbacks = new Callbacks(this.namespace('socket'));
  this._message = new Message(this._callbacks);

  this.join('all');

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
 * (Static) Rooms
 */

Socket.rooms = Room.rooms;


/*
 * (Private) Process
 * Processes messages received on the socket
 *
 * - data (string)
 */

Socket.prototype._process = function _process (data) {
  var message = this._message.parse(data);
  var details = Namespace.parse(message.event);

  var arg1 = message.arg1;
  var arg2 = message.arg2;
  var arg3 = message.arg3;

  var event = details.event;
  var namespace = details.namespace;
  var ns = this._namespaces[namespace];

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

Socket.prototype._handleWith = function _handleWith (name) {
  this._handle = handle(name);
};


/*
 * Connect
 * Connect to a socket
 *
 * - socket (Object)
 */

Socket.prototype.connect = function connect (socket, handle) {
  var self = this;

  if (handle) this._handleWith(handle);

  this.socket = socket;
  this.id = this._handle.identify(socket);

  this._handle.onread(this.socket, function handleOnRead (message) {
    self._process(message);
  });

  this._handle.onopen(this.socket, function handleOnOpen (event) {
    self._emit('socket.open', event);
  });

  this._handle.onerror(this.socket, function handleOnError (event) {
    self._emit('socket.error', event);
  });

  this._handle.onclose(this.socket, function handleOnClose (status, message) {
    self.disconnect();
    self._emit('socket.close', status, message);
  });
};


/*
 * Disconnnect
 * The opposite of `connect`.
 *
 * Remove the socket from any rooms it is in.
 * Also release control of the socket.
 */

Socket.prototype.disconnect = function disconnect () {
  this._handle.release(this.socket);

  var len = this.rooms.length;
  for (var i = len - 1; i >= 0; i--) {
    this.leave(this.rooms[i]);
  }
};


/*
 * Namespace
 * If the namespace already exists it will be used instead
 *
 * - name (string)
 * > namespace
 */

Socket.prototype.namespace = function namespace (name) {
  var ns = this._namespaces[name];
  ns = ns ? ns : this._namespaces[name] = new Namespace(name, this);
  return ns;
};


/*
 * Send a message through the socket
 *
 * - event (string)
 * - args... (mixed) : any data you want to send
 */

Socket.prototype.emit = function emit (event, arg1, arg2, arg3) {
  if (event === 'newListener' || event === 'removeListener') {
    return this._emit(event, arg1, arg2, arg3);
  }

  var message = this._message.serialize(event, arg1, arg2, arg3);

  this._handle.write(this.socket, message);
};




/*
 * Join
 *
 * - room (string)
 */

Socket.prototype.join = function join (room) {
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

Socket.prototype.leave = function leave (room) {
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
 *
 * Forget everything.
 * TODO: Possibly overkill.
 */

Socket.prototype.release = function release () {
  if (! this._message) return;

  this.disconnect();

  for (var key in this._namespaces) {
    this._namespaces[key]._release();
  }

  this._callbacks.release();
  this._message.release();

  delete this._namespaces;
  delete this._callbacks;
  delete this._message;
  delete this.socket;
  delete this.broadcast;
  delete this.rooms;
  delete this.id;
  delete this._handle;
};


module.exports = Socket;
