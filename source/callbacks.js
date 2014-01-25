(function () {

  'use strict';

  var Callbacks;

  /*
   * Callbacks Constructor
   */

  Callbacks = function (namespace) {
    this.collection = {};
    this.index = 0;
    this.namespace = namespace;
  };


  /*
   * Register
   *
   * - fn (function) : the callback
   * > callback id (int)
   */

  Callbacks.prototype.register = function (fn) {
    var self, id, args;

    self = this;
    id = this.index++;
    this.collection[id] = fn;

    this.namespace.on('fn_' + id, function() {
      args = Array.prototype.slice.call(arguments);
      args.unshift(id);
      self.exec.apply(self, args);
    });

    return id;
  };


  /*
   * Exec
   * Deletes the callback afterwards so it can only be executed once.
   *
   * - id (int) : callback id
   * - args (array) : arguments
   */

  Callbacks.prototype.exec = function (id) {
    var args;
    args = Array.prototype.slice.call(arguments, 1);
    this.collection[id].apply(this, args);
    delete this.collection[id];
  };


  module.exports = Callbacks;

}());
