(function () {

  'use strict';

  var Socket, Namespace, Callbacks, Room, broadcastFrom,
      EventEmitter, inherits,
      EVENT_ARGS, FN, NS_EVENT, CALLBACK;

  /*
   * Dependencies
   */

  EventEmitter = require('events').EventEmitter;
  Namespace = require('./namespace');
  Callbacks = require('./callbacks');
  Room = require('./room');
  inherits = require('./util').inherits;
  broadcastFrom = require('./broadcast');
  broadcastFrom.init(Room);


  /*
   * Constants
   */

  FN = /\.fn\((\d+)\)$/;
  EVENT_ARGS = /^([^\(]+)\((.*)\)/;
  NS_EVENT = /^([\w-]+\.)?([^\.\(]+)$/;

  /*
   * Socket Constructor
   *
   * - [socket] (Object) : socket to send and receive messages over
   */

  Socket = function (socket) {
    Socket.super_.call(this);

    this.namespaces = {};
    this.rooms = [];
    this.callbacks = new Callbacks(this.namespace('Jandal'));

    this.join('all');
    broadcastFrom(this);

    if (socket) {
      this.connect(socket);
    }
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

  Socket.in = Room.prototype.in;


  /*
   * (Private) Process
   * Processes messages received on the socket
   *
   * - data (string)
   */

  Socket.prototype._process = function (data) {
    var message, namespace, callback, event, args;

    message = this.parse(data);
    event = message.event;
    args = message.args;
    args.unshift(event);

    namespace = this.namespaces[message.namespace];
    if (message.namespace && namespace) {
      namespace._emit.apply(namespace, args);
    } else {
      this._emit.apply(this, args);
    }
  };


  /*
   * (Private) Callback
   *
   * - id (int) : the callback id
   * > function
   */

  Socket.prototype._callback = function (id) {
    var self = this;
    return function () {
      var args = Array.prototype.slice.call(arguments);
      args.unshift('Jandal.fn_' + id);
      self.emit.apply(self, args);
    };
  };


  /*
   * Connect
   * Connect to a socket
   *
   * - socket (Object)
   */

  Socket.prototype.connect = function (socket) {
    var self = this;
    this.socket = socket;

    Socket._handle.open(this.socket, function (event) {
      self._emit('socket.open', event);
    });

    Socket._handle.read(this.socket, function (message) {
      self._process(message);
    });

    Socket._handle.error(this.socket, function (event) {
      self._emit('socket.error', event);
    });

    Socket._handle.close(this.socket, function (event) {
      self.release();
      self._emit('socket.close', event)
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
    var namespace = this.namespaces[name];
    if (! namespace) {
      namespace = this.namespaces[name] = new Namespace(name, this);
    }
    return namespace;
  };


  /*
   * Serialize
   *
   * - message (object)
   * > string
   */

  Socket.prototype.serialize = function (message) {
    var string, args, i, len, arg, cb;

    args = message.args || [];
    len = args.length;

    for (i = len - 1; i >= 0; i--) {
      arg = args[i];
      if (typeof arg === 'function') {
        if (cb !== undefined) {
          throw new Error('Limit of one callback per message!');
        }
        cb = this.callbacks.register(arg);
        args.splice(i, 1);
      }
    }


    args = JSON.stringify(args);

    string = message.event + '(';
    string += args.slice(1, -1) + ')';

    if (cb !== undefined) {
      string += '.fn(' + cb + ')';
    }

    return string;
  };


  /*
   * Parse
   *
   * - message (string)
   * > object
   */

  Socket.prototype.parse = function (message) {
    var namespace, event, args, match, fn;
    if (typeof message !== 'string') return false;

    match = message.match(FN);
    if (match) {
      fn = match[1];
      message = message.slice(0, match.index);
    }

    match = message.match(EVENT_ARGS);
    if (! match) return false;

    args = match[2];

    match = match[1].match(NS_EVENT);
    if (! match) return false;

    event = match[2];
    namespace = match[1];
    namespace = namespace ? namespace.slice(0, -1) : false;

    try {
      args = JSON.parse('[' + args + ']');
    } catch (e) {
      return false;
    }

    if (fn !== undefined) {
      args.push(this._callback(fn));
    }

    return {
      namespace: namespace,
      event: event,
      args: args
    };
  };


  /*
   * Send a message through the socket
   *
   * - event (string)
   * - args... (mixed) : any data you want to send
   */

  Socket.prototype.emit = function (event) {
    var args;

    if (event === 'newListener' || event === 'removeListener') {
      return this._emit.apply(this, args);
    }

    args = Array.prototype.slice.call(arguments, 1);

    Socket._handle.write(this.socket, this.serialize({
      event: event,
      args: args
    }));
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
      room.join(this);
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
      room.leave(this);
    }
  };


  /*
   * Room
   *
   * - name (string)
   */

  Socket.prototype.room = Room.prototype.in;


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

}());
