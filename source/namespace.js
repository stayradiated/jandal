(function () {

  'use strict';

  var Namespace, broadcastFrom, EventEmitter, inherits; 


  /*
   * Dependencies
   */

  broadcastFrom = require('./broadcast');
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

    broadcastFrom(this.item, this, '_broadcast');
    delete this.broadcast.to;
  };


  /*
   * Inherit from EventEmitter
   */

  inherits(Namespace, EventEmitter);
  Namespace.prototype._emit = EventEmitter.prototype.emit;


  /*
   * Emit
   *
   * - event (string)
   * - args... (mixed) : any other data you want to send
   */

  Namespace.prototype.emit = function (event, arg1, arg2, arg3) {
    event = this.name + '.' + event;
    this.item.emit(event, arg1, arg2, arg3);
  };


  /*
   * Broadcast
   *
   * - event (string)
   * - args... (mixed)
   */

  Namespace.prototype.broadcast = function (event, arg1, arg2, arg3) {
    event = this.name + '.' + event;
    this._broadcast(event, arg1, arg2, arg3);
  };


  module.exports = Namespace;

}());
