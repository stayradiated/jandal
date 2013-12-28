(function () {

  'use strict';

  var Socket, Namespace, Callbacks, Room,
      EventEmitter, inherits,
      EVENT_ARGS, NS_EVENT, CALLBACK;

  /*
   * Dependencies
   */

  EventEmitter = require('events').EventEmitter;
  Namespace = require('./namespace');
  Callbacks = require('./callbacks');
  Room = require('./room');
  inherits = require('./util').inherits;


  /*
   * Constants
   */

  EVENT_ARGS = /^([^\(]+)\((.*)\)$/;
  NS_EVENT = /^([\w-]+\.)?([^\(]+)$/;
  CALLBACK = /__fn__(\d+)/;


  /*
   * Socket Constructor
   */

  Socket = function (socket) {
    Socket.super_.call(this);

    this.join('all');
    this.socket = socket;
    this.namespaces = {};
    this.rooms = [];
    this.callbacks = new Callbacks();

    var self = this;
    Socket._handle.read(this.socket, function (message) {
      self._process(message);
    });
    Socket._handle.close(this.socket, function () {
      self.release();
    });
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
    var message, namespace, callback;

    message = this.parse(data);

    callback = message.event.match(CALLBACK);
    if (callback) {
      return this.callbacks.exec(callback[1], message.args);
    }

    message.args.unshift(message.event);
    namespace = this.namespaces[message.namespace];

    if (message.namespace && namespace) {
      namespace._emit.apply(namespace, message.args);
    } else {
      this._emit.apply(this, message.args);
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
      args.unshift('__fn__' + id);
      self.emit.apply(self, args);
    };
  };


  /*
   * Namespace
   * If the namespace already exists it will be used instead
   *
   * - name (string)
   * > namespace
   */

  Socket.prototype.namespace = function (name) {
    var namespace;
    namespace = this.namespaces[name];
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
    var string, args, len, i, arg;

    args = message.args;
    len = args.length;

    for (i = 0; i < len; i++) {
      arg = args[i];
      if (typeof arg === 'function') {
        args[i] = '__fn__' + this.callbacks.register(arg);
      }
    }

    string = message.event + '(';
    args = JSON.stringify(args);
    string += args.slice(1, -1) + ')';

    return string;
  };


  /*
   * Parse
   *
   * - message (string)
   * > object
   */

  Socket.prototype.parse = function (message) {
    var namespace, event, args, len, i, arg, match;

    match = message.match(EVENT_ARGS);

    if (! match) {
      throw new Error('Could not parse', message);
    }

    args  = match[2];
    match = match[1].match(NS_EVENT);
    event = match[2];

    namespace = match[1];
    namespace = namespace ? namespace.slice(0, -1) : false;

    args = JSON.parse('[' + args + ']');
    len = args.length;

    // Replace callback ids with functions
    for (i = 0; i < len; i++) {
      arg = args[i];
      if (typeof arg === 'string') {
        match = arg.match(CALLBACK);
        if (match) {
          args[i] = this._callback(match[1]);
        }
      }
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

    // EventEmitter events are proxied
    if (event === 'newListener' || event === 'removeListener') {
      return this._emit.apply(this, arguments);
    }

    Socket._handle.write(this.socket, this.serialize({
      event: event,
      args: Array.prototype.slice.call(arguments, 1)
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
