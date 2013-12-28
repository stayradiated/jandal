(function () {

  'use strict';

  var Namespace, EventEmitter, inherits, Socket;


  /*
   * Dependencies
   */

  EventEmitter = require('events').EventEmitter;
  inherits = require('./util').inherits;


  /*
   * Namespace Constructor
   *
   * - name (string)
   * - item (socket) : a single socket
   * - item (room) : a collection of sockets
   */

  Namespace = function (name, item) {
    Namespace.super_.call(this);

    this.name = name;
    this.item = item;
  };


  /*
   * Inherit from EventEmitter
   */

  inherits(Namespace, EventEmitter);
  Namespace.prototype._emit = EventEmitter.prototype.emit;


  /*
   * Resolve circular dependency with Socket
   */

  module.exports = Namespace;
  Socket = require('./socket');


  /*
   * Emit
   *
   * - event (string)
   * - args... (mixed) : any other data you want to send
   */

  Namespace.prototype.emit = function (event) {
    var args;

    args = Array.prototype.slice.call(arguments);
    args[0] = this.name + '.' + event;

    this.item.emit.apply(this.item, args);
  };


  /*
   * Broadcast
   *
   * - event (string)
   * - args... (mixed)
   */

  Namespace.prototype.broadcast = function (event) {
    var args;

    args = Array.prototype.slice(arguments);
    args.unshift(item);
    Socket.sockets.broadcast.apply(Socket.sockets, args);
  };


  /*
   * Broadcast.to
   *
   * - room (string)
   */

  Namespace.prototype.broadcast.to = function () {
    throw new Error('this has not been written yet');
  };


}());
