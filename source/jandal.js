(function () {

  'use strict';

  var Jandal, Namespace, Callbacks, jandalHandles,
      EventEmitter, inherits, root, previousJandal,
      EVENT_ARGS, NS_EVENT, CALLBACK;


  /*
   * Setup
   */

  root = this;
  previousJandal = root.Jandal;


  /*
   * Dependencies
   */

  EventEmitter = require('events').EventEmitter;
  jandalHandles = require('./handles');
  Namespace = require('./namespace');
  Callbacks = require('./callbacks');
  inherits = require('./util').inherits;


  /*
   * Constants
   */

  EVENT_ARGS = /^([^\(]+)\((.*)\)$/;
  NS_EVENT = /^([\w-]+\.)?([^\(]+)$/;
  CALLBACK = /__fn__(\d+)/;


  /*
   * Jandal Constructor
   */

  Jandal = function (socket) {
    Jandal.super_.call(this);

    this.socket = socket;
    this.namespaces = {};
    this.callbacks = new Callbacks();

    var self = this;
    Jandal._handle.read(this.socket, function (message) {
      self._process(message);
    });
  };


  /*
   * Inherit from EventEmitter
   */

  inherits(Jandal, EventEmitter);
  Jandal.prototype._emit = EventEmitter.prototype.emit;


  /*
   * (Static) Handle
   * Choose how to attach to the socket
   *
   * - name (string) : a key from jandalHandles (currently 'node' or 'sockjs')
   */

  Jandal.handle = function (name) {
    var handle = jandalHandles[name];
    if (! handle) {
      throw new Error('Jandal handler "' + name + '"could not be found');
    }
    this._handle = handle;
  };


  /*
   * (Static) noConflict
   *
   * > this
   */

  Jandal.noConflict = function () {
    root.Jandal = previousJandal;
    return Jandal;
  };



  /*
   * (Private) Process
   * Processes messages received on the socket
   *
   * - data (string)
   */

  Jandal.prototype._process = function (data) {
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
   * If the namespace already exists it will be used instead
   *
   * - name (string)
   * > namespace
   */

  Jandal.prototype.namespace = function (name) {
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

  Jandal.prototype.serialize = function (message) {
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

  Jandal.prototype.parse = function (message) {
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

  Jandal.prototype.emit = function (event) {

    // EventEmitter events are proxied
    if (event === 'newListener' || event === 'removeListener') {
      return this._emit.apply(this, arguments);
    }

    Jandal._handle.write(this.socket, this.serialize({
      event: event,
      args: Array.prototype.slice.call(arguments, 1)
    }));
  };


  /*
   * Exporting Jandal through module.exports or window.Jandal
   */

  if (typeof global.process !== 'undefined') {
    module.exports = Jandal;
  } else {
    root.Jandal = Jandal;
  }

}).call(this);
