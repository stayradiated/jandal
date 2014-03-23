'use strict';

/*
 * Dependencies
 */

var Broadcast = require('./broadcast');
var EventEmitter = require('events').EventEmitter;
var inherits = require('./util').inherits;


/*
 * Namespace Constructor
 *
 * - name (string)
 * - item (socket) : a single socket
 * - item (room) : a collection of sockets
 */

var Namespace = function Namespace (name, item) {
  Namespace.super_.call(this);

  this.name = name;
  this.item = item;

  Broadcast.attach(this.item, this, '_broadcast');
};


/*
 * Inherit from EventEmitter
 */

inherits(Namespace, EventEmitter);
Namespace.prototype._emit = EventEmitter.prototype.emit;


Namespace.parse = function parse (string) {
  var namespace, event;
  string = string.split('.');
  if (string.length === 2) {
    namespace = string[0];
    event = string[1];
  } else {
    event = string[0];
  }
  return {
    namespace: namespace,
    event: event
  };
};

/*
 * Emit
 *
 * - event (string)
 * - args... (mixed) : any other data you want to send
 */

Namespace.prototype.emit = function emit (event, arg1, arg2, arg3) {
  event = this.name + '.' + event;
  this.item.emit(event, arg1, arg2, arg3);
};


/*
 * Broadcast
 *
 * - event (string)
 * - args... (mixed)
 */

Namespace.prototype.broadcast = function broadcast (event, arg1, arg2, arg3) {
  event = this.name + '.' + event;
  this._broadcast(event, arg1, arg2, arg3);
};


module.exports = Namespace;
