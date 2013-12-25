(function () {

  'use strict';

  var Namespace, EventEmitter, inherits;


  /*
   * Dependencies
   */

  EventEmitter = require('events').EventEmitter;
  inherits = require('./util').inherits;


  /*
   * Namespace Constructor
   */

  Namespace = function (name, jandal) {
    Namespace.super_.call(this);

    this.name = name;
    this.jandal = jandal;
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

  Namespace.prototype.emit = function (event) {
    var args;

    args = Array.prototype.slice.call(arguments);
    args[0] = this.name + '.' + event;

    this.jandal.emit.apply(this.jandal, args);
  };


  module.exports = Namespace;

}());
