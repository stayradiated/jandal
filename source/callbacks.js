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
  var self, id;

  self = this;
  id = this.index++;
  this.collection[id] = fn;

  this.namespace.once('fn_' + id, function(arg1, arg2, arg3) {
    self.exec(id, arg1, arg2, arg3);
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

Callbacks.prototype.exec = function (id, arg1, arg2, arg3) {
  if (! this.collection.hasOwnProperty(id)) return;
  this.collection[id](arg1, arg2, arg3);
  delete this.collection[id];
};


module.exports = Callbacks;
