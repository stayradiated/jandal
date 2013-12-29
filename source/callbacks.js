(function () {

  'use strict';

  var Callbacks;

  /*
   * Callbacks Constructor
   */

  Callbacks = function () {
    this.collection = {};
    this.index = 0;
  };


  /*
   * Register
   *
   * - fn (function) : the callback
   * > callback id (int)
   */

  Callbacks.prototype.register = function (fn) {
    this.collection[this.index] = fn;
    return this.index++;
  };


  /*
   * Exec
   * Deletes the callback afterwards so it can only be executed once.
   *
   * - id (int) : callback id
   * - args (array) : arguments
   */

  Callbacks.prototype.exec = function (id, arg1, arg2, arg3) {
    this.collection[id](arg1, arg2, arg3);
    delete this.collection[id];
  };


  module.exports = Callbacks;

}());
