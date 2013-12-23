(function () {

  'use strict';

  var Jandal, Namespace, Callbacks, EventEmitter, util, REGEX, CALLBACK;

  /*
   * Dependencies
   */

  EventEmitter = require('events').EventEmitter;
  util = require('util');


  /*
   * Constants
   */

  REGEX = /^(\w+\.)?(\w+)\((.*)\)$/;
  CALLBACK = /__fn__(\d+)/;


  /*
   * Callbacks Constructor
   */

  Callbacks = function () {
    this.collection = {};
    this.index = 0;
  };

  Callbacks.prototype.register = function (fn) {
    this.collection[this.index] = fn;
    return this.index++;
  };

  Callbacks.prototype.exec = function (id, args) {
    this.collection[id].apply(this, args);
    delete this.collection[id];
  };


  /*
   * Namespace Constructor
   */

  Namespace = function (name, jandal) {
    EventEmitter.call(this);

    this.name = name;
    this.jandal = jandal;
  };


  /*
   * Inherit from EventEmitter
   */

  util.inherits(Namespace, EventEmitter);
  Namespace.prototype._emit = EventEmitter.prototype.emit;

  Namespace.prototype.emit = function (event) {
    var args;

    args = Array.prototype.slice.call(arguments);
    args[0] = this.name + '.' + event;

    this.jandal.emit.apply(this.jandal, args);
  };


  /*
   * Jandal Constructor
   */

  Jandal = function (socket) {
    EventEmitter.call(this);

    this.socket = socket;
    this.namespaces = {};
    this.callbacks = new Callbacks();

    var self = this;
    this.socket.on('data', function (data) {
      self._handle(data);
    });
  };


  /*
   * Inherit from EventEmitter
   */

  util.inherits(Jandal, EventEmitter);
  Jandal.prototype._emit = EventEmitter.prototype.emit;


  /*
   * (Private) Handle
   *
   * - data (string)
   */

  Jandal.prototype._handle = function (data) {
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
   */

  Jandal.prototype._callback = function (id) {
    var self = this;
    return function () {
      var args = Array.prototype.slice.call(arguments);
      args.unshift('__fn__' + id);
      self.emit.apply(self, args);
    };
  };


  /*
   * Namespace
   *
   * - name (string)
   */

  Jandal.prototype.namespace = function (name) {
    var namespace;

    namespace = this.namespaces[name];

    if (! namespace) {
      namespace = new Namespace(name, this);
      this.namespaces[name] = namespace;
    }

    return namespace;
  };


  /*
   * Serialize
   *
   * - message (object)
   * > string
   */

  Jandal.prototype.serialize = function (message) {
    var string, args, len, i, arg;

    args = message.args;
    len = args.length;

    for (i = 0; i < len; i++) {
      arg = args[i];
      if (typeof arg === 'function') {
        args[i] = '__fn__' + this.callbacks.register(arg);
      }
    };

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

  Jandal.prototype.parse = function (message) {
    var namespace, args, len, i, arg, match;

    message = message.match(REGEX);

    namespace = message[1];
    namespace = namespace ? namespace.slice(0, -1) : false;

    args = JSON.parse('[' + message[3] + ']');
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
      event: message[2],
      args: args
    };

  };


  /*
   * Send a message through the socket
   */

  Jandal.prototype.emit = function (event) {

    // EventEmitter events are proxied
    if (event === 'newListener' || event === 'removeListener') {
      return this._emit.apply(this, arguments);
    }


    this.socket.write(this.serialize({
      event: event,
      args: Array.prototype.slice.call(arguments, 1)
    }));
  };


  module.exports = Jandal;

}());
