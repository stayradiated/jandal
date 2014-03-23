'use strict';

var should = require('should');
var Callbacks = require('../../source/callbacks');

var namespace = {
  reset: function () {
    namespace.listeners = {};
  },
  listeners: {},
  once: function (event, fn) {
    if (! namespace.listeners[event]) {
      namespace.listeners[event] = [];
    }
    namespace.listeners[event].push(fn);
  }
};

describe('Callbacks', function () {

  beforeEach(function() {
    namespace.reset();
  });

  describe(':constructor', function () {

    it('should create a new callbacks instance', function () {
      var callbacks = new Callbacks(namespace);
      callbacks.should.have.keys('collection', 'index', 'namespace');
    });

  });

  describe(':register', function () {

    it('should register a new callback', function (done) {
      var callbacks = new Callbacks(namespace);

      var fn = function (a, b, c) {
        arguments.should.eql([1,2,3]);
        done();
      };

      var id = callbacks.register(fn);

      id.should.be.have.type('number');
      callbacks.collection.should.keys(id.toString());
      callbacks.index.should.equal(id + 1);

      var listener = namespace.listeners['fn_' + id];
      listener.should.have.length(1);
      listener[0].should.have.type('function');
      listener[0](1, 2, 3);
    });

  });

  describe(':exec', function () {

    it('should execute a callback', function (done) {
      var callbacks = new Callbacks(namespace);

      var fn = function (a, b, c) {
        arguments.should.eql([1, 2, 3]);
        done();
      };

      var id = callbacks.register(fn);

      callbacks.exec(id, 1, 2, 3);
    });

    it('should only execute a callback once', function (done) {
      var callbacks = new Callbacks(namespace);

      var fn = function (x) {
        x.should.equal(1);
        done();
      };

      var id = callbacks.register(fn);

      callbacks.exec(id, 1);
      callbacks.exec(id, 2);
      callbacks.exec(id, 3);

    });

  });

});
