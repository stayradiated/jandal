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
   */

  Socket = function (socket) {
    Socket.super_.call(this);

    var self = this;

    this.socket = socket;
    this.namespaces = {};
    this.rooms = [];
    this.callbacks = new Callbacks(this.namespace('Jandal'));

    this.join('all');
    broadcastFrom(this);

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
    var message, namespace, callback, event, arg1, arg2, arg3;

    message = this.parse(data);
    event = message.event;
    arg1 = message.arg1;
    arg2 = message.arg2;
    arg3 = message.arg3;

    namespace = this.namespaces[message.namespace];
    if (message.namespace && namespace) {
      namespace._emit(event, arg1, arg2, arg3);
    } else {
      this._emit(event, arg1, arg2, arg3);
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
    return function (arg1, arg2, arg3) {
      self.emit('Jandal.fn_' + id, arg1, arg2, arg3);
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
    var string, args, i, arg, arg1, arg2, arg3, cb;

    for (i = 1; i < 4; i++) {
      arg = 'arg' + i;
      if (typeof message[arg] === 'function') {
        if (cb !== undefined) {
          throw new Error('Limit of one callback per message!');
        }
        cb = this.callbacks.register(message[arg]);
        message[arg] = undefined;
      }
    }

    arg1 = message.arg1;
    arg2 = message.arg2;
    arg3 = message.arg3;

    if (arg1 === undefined && arg2 === undefined && arg3 === undefined) {
      args = [];
    }
    else if (arg2 === undefined && arg3 === undefined) {
      args = [arg1];
    }
    else if (arg3 === undefined) {
      args = [arg1, arg2];
    }
    else {
      args = [arg1, arg2, arg3];
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
      arg1: args[0],
      arg2: args[1],
      arg3: args[2]
    };
  };


  /*
   * Send a message through the socket
   *
   * - event (string)
   * - args... (mixed) : any data you want to send
   */

  Socket.prototype.emit = function (event, arg1, arg2, arg3) {
    if (event === 'newListener' || event === 'removeListener') {
      return this._emit(event, arg1, arg2, arg3);
    }

    Socket._handle.write(this.socket, this.serialize({
      event: event,
      arg1: arg1,
      arg2: arg2,
      arg3: arg3
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
