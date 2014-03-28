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
  Namespace.__super__.call(this);

  this.name = name;
  this.item = item;
  this._broadcast = Broadcast.bind(this.item);
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


/*
 * (Private) Release
 */

Namespace.prototype._release = function release () {
  delete this.name;
  delete this.item;
  delete this._broadcast;
};


module.exports = Namespace;
