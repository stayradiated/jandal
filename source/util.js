'use strict';

var util = {};

/*
 * util.inherits for browsers
 */

util.inherits = function inherits (ctor, superCtor) {
  ctor.__super__ = superCtor;
  ctor.prototype = Object.create(superCtor.prototype, {
    constructor: {
      value: ctor,
      enumerable: false,
      writable: true,
      configurable: true
    }
  });
};

module.exports = util;
