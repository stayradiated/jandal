'use strict';

var should, Namespace, Socket;

should    = require('should');
Namespace = require('../../source/namespace');
Socket    = require('../fake_socket');

describe('Namespace', function () {

  beforeEach(function () {
    Socket.reset();
  });

  describe(':constructor', function () {

    it('should create a new namespace', function () {
      var namespace, item;

      item = new Socket();

      namespace = new Namespace('name', item);
      namespace.name.should.equal('name');
      namespace.item.should.equal(item);
    });

  });

  describe(':emit', function () {

    it('should emit to a namespace', function () {
      var namespace, item;

      item = new Socket();
      namespace = new Namespace('ns', item);

      namespace.emit('event', 1, 2, 3);
      item.last().should.eql(['ns.event', 1, 2, 3]);
    });

  });

  describe(':broadcast', function () {

    it('should broadcast to a namespace', function () {
      var namespace, item, other;

      item = new Socket();
      other = new Socket();
      namespace = new Namespace('ns', item);

      namespace.broadcast('broadcast', 3, 2, 1);
      should.equal(undefined, item.last());
      other.last().should.eql(['ns.broadcast', 3, 2, 1]);
    });

  });

});
