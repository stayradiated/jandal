(function () {

  'use strict';

  var Jandal, Namespace, EventEmitter, util;


  /*
   * Dependencies
   */

  EventEmitter = require('events').EventEmitter;
  util = require('util');


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
    var message, namespace;

    message = this.parse(data);
    message.args.unshift(message.event);
    namespace = this.namespaces[message.namespace];

    if (message.namespace && namespace) {
      namespace._emit.apply(namespace, message.args);
    } else {
      this._emit.apply(this, message.args);
    }
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
    var string, args;

    string = message.event + '(';
    args = JSON.stringify(message.args);
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
    var namespace, args;
    var regex = /^(\w+\.)?(\w+)\((.*)\)$/;

    message = message.match(regex);

    namespace = message[1];
    namespace = namespace ? namespace.slice(0, -1) : false;

    args = JSON.parse('[' + message[3] + ']');

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
