'use strict';

/*
 * Constants
 */

var PREFIX = 'fn_';


/*
 * Callbacks Constructor
 */

var Callbacks = function Callbacks (namespace) {
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

Callbacks.prototype.register = function register (fn) {
  var self = this;
  var id = this.index++;
  this.collection[id] = fn;

  this.namespace.once(PREFIX + id, function callbackListener (arg1, arg2, arg3) {
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

Callbacks.prototype.exec = function exec (id, arg1, arg2, arg3) {
  if (! this.collection.hasOwnProperty(id)) return;
  this.collection[id](arg1, arg2, arg3);
  delete this.collection[id];
};



/*
 * (Private) Get Fn
 *
 * - id (int) : the callback id
 * > function
 */


Callbacks.prototype.getFn = function getFn (id) {
  var self = this;
  return function callback (arg1, arg2, arg3) {
    self.namespace.emit(PREFIX + id, arg1, arg2, arg3);
  };
};


/*
 * Release
 */

Callbacks.prototype.release = function release () {
  delete this.collection;
  delete this.index;
  delete this.namespace;
};


module.exports = Callbacks;
