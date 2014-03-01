'use strict';

var Room, Socket, should;

should = require('should');
Room   = require('../../source/room');
Socket = require('../fake_socket');

describe('Room', function () {

  beforeEach(function () {
    Socket.reset();
  });

  describe('.get', function() {

    it('should get a room', function () {
      var room;

      // Creates it if it doesn't exist
      room = Room.get('some-room');
      room.should.be.an.instanceOf(Room);

      // Reuse the same instance
      Room.get('some-room').should.equal(room);

    });

  });

  describe('.flush', function () {

    it('should destroy all the rooms', function () {
      var room, socket;

      // create a new room
      room = Room.get('a');

      // add a socket to the room
      socket = new Socket();
      socket.join('a');
      room.sockets.should.have.length(1);

      // flush all the rooms
      Room.flush();

      // the socket should not longer be in the room
      room.sockets.should.have.length(0);

      // the room should have been removed
      Room.get('a').should.not.equal(room);
    });

  });

  describe(':constructor', function () {

    it('should create a new Room', function () {
      var room;

      room = new Room('my-room');

      room.should.have.keys('id', 'sockets', '_namespaces');
      room.id.should.equal('my-room');

      // should not add to Room.rooms
      Room.get('my-room').should.not.equal(room);
    });

  });

  describe(':_join', function () {

    it('should add a socket to a room', function () {
      var room, socket;

      room = new Room('my-room');
      socket = new Socket();

      room._join(socket);
      room.length().should.equal(1);

      // should only add it once
      room._join(socket);
      room.length().should.equal(1);

      // add another socket
      socket = new Socket();

      room._join(socket);
      room.length().should.equal(2);
    });

  });

  describe(':_leave', function () {

    it('should remove a socket from a room', function () {
      var room, socket;

      room = new Room('my-awesome-room');
      socket = new Socket();

      room.length().should.equal(0);

      // should not care if socket isn't in the room
      room._leave(socket);
      room.length().should.equal(0);

      // add the socket
      room._join(socket);
      room.length().should.equal(1);

      // remove the socket
      room._leave(socket);
      room.length().should.equal(0);
    });

  });

  describe(':in', function () {

    it('should proxy Room.get', function () {
      var a, b;

      a = Room.get('a');
      b = Room.get('b');

      a.in('a').should.equal(a);
      a.in('b').should.equal(b);
      b.in('a').should.equal(a);
      b.in('b').should.equal(b);
    });

  });

  describe(':length', function () {

    it('should count how many sockets are in a room', function () {
      var room;

      room = new Room('my-room');
      room.length().should.equal(0);

      room._join('a');
      room.length().should.equal(1);

      room._join('b');
      room.length().should.equal(2);

      room._join('c');
      room.length().should.equal(3);

      room._join('d');
      room.length().should.equal(4);

      room._leave('d');
      room.length().should.equal(3);

      room._leave('c');
      room.length().should.equal(2);

      room._leave('b');
      room.length().should.equal(1);

      room._leave('a');
      room.length().should.equal(0);
    });

  });

  describe(':emit', function () {

    it('should emit to all sockets in a room', function () {
      var room, a, b, c;

      room = Room.get('my-room');

      a = new Socket();
      b = new Socket();
      c = new Socket();

      a.join('my-room');
      b.join('my-room');
      c.join('my-room');

      room.length().should.equal(3);

      room.emit('three', 1, 2, 3);

      a.last().should.eql(['three', 1, 2, 3]);
      b.last().should.eql(['three', 1, 2, 3]);
      c.last().should.eql(['three', 1, 2, 3]);

      a.leave('my-room');
      room.length().should.equal(2);

      room.emit('two', 1, 2, 3);

      a.last().should.eql(['three', 1, 2, 3]);
      b.last().should.eql(['two', 1, 2, 3]);
      c.last().should.eql(['two', 1, 2, 3]);

      b.leave('my-room');
      room.length().should.equal(1);

      room.emit('one', 1, 2, 3);

      a.last().should.eql(['three', 1, 2, 3]);
      b.last().should.eql(['two', 1, 2, 3]);
      c.last().should.eql(['one', 1, 2, 3]);

      c.leave('my-room');
      room.length().should.equal(0);

      room.emit('zero', 1, 2, 3);

      a.last().should.eql(['three', 1, 2, 3]);
      b.last().should.eql(['two', 1, 2, 3]);
      c.last().should.eql(['one', 1, 2, 3]);
    });

  });

  describe(':broadcast', function () {

    it('should broadcast to all sockets in a room', function () {
      var room, a, b, c;

      room = Room.get('my-room');
      
      a = new Socket();
      b = new Socket();
      c = new Socket();

      a.join('my-room');
      b.join('my-room');
      c.join('my-room');

      // from a
      room.broadcast(a.id, 'three', 1, 2, 3);

      should.equal(undefined, a.last());
      b.last().should.eql(['three', 1, 2, 3]);
      c.last().should.eql(['three', 1, 2, 3]);

      // from b
      room.broadcast(b.id, 'two', 1, 2, 3);

      a.last().should.eql(['two', 1, 2, 3]);
      b.last().should.eql(['three', 1, 2, 3]);
      c.last().should.eql(['two', 1, 2, 3]);

      // from c
      room.broadcast(c.id, 'one', 1, 2, 3);

      a.last().should.eql(['one', 1, 2, 3]);
      b.last().should.eql(['one', 1, 2, 3]);
      c.last().should.eql(['two', 1, 2, 3]);
    });

  });

  describe(':namespace', function () {

    it('should get a namespace for a room', function () {
      var room, ns;

      room = new Room('with-a-ns');
      ns = room.namespace('my-ns');

      room.namespace('my-ns').should.equal(ns);
      room.namespace('my-other-ns').should.not.equal(ns);
    });

  });

  describe(':contains', function () {

    it('should check if a room contains a socket', function () {
      var room, socket;

      room = Room.get('your-room');

      socket = new Socket();
      room.contains(socket).should.equal(false);

      socket.join('your-room');
      room.contains(socket).should.equal(true);

      socket.leave('your-room');
      room.contains(socket).should.equal(false);

      room._join(socket);
      room.contains(socket).should.equal(true);
    });

  });

  describe(':empty', function () {

    it('should empty a room', function () {
      var room, socket;

      room = Room.get('that-room');
      socket = new Socket();
      socket.join('that-room');

      room.length().should.equal(1);

      room.empty();

      room.length().should.equal(0);
    });

  });

});
