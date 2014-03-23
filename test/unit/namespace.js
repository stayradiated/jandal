'use strict';

var should    = require('should');
var Namespace = require('../../source/namespace');
var Socket    = require('../fake_socket');

describe('Namespace', function () {

  beforeEach(function () {
    Socket.reset();
  });

  describe(':constructor', function () {

    it('should create a new namespace', function () {
      var item = new Socket();

      var namespace = new Namespace('name', item);
      namespace.name.should.equal('name');
      namespace.item.should.equal(item);
    });

  });

  describe(':emit', function () {

    it('should emit to a namespace', function () {
      var item = new Socket();
      var namespace = new Namespace('ns', item);

      namespace.emit('event', 1, 2, 3);
      item.last().should.eql(['ns.event', 1, 2, 3]);
    });

  });

  describe(':broadcast', function () {

    it('should broadcast to a namespace', function () {
      var item = new Socket();
      var other = new Socket();
      var namespace = new Namespace('ns', item);

      namespace.broadcast('broadcast', 3, 2, 1);
      should.equal(undefined, item.last());
      other.last().should.eql(['ns.broadcast', 3, 2, 1]);
    });

  });

});
