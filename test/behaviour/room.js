'use strict';

var should    = require('should');
var Room      = require('../../source/room');
var Namespace = require('../../source/namespace');
var Broadcast = require('../../source/broadcast');
var Socket    = require('../fake_socket');

describe('Room', function () {

  beforeEach(function () {
    Broadcast.init(Room);
  });

  afterEach(function () {
    Room.flush();
  });

  it('can create rooms', function () {
    var room = Room.get('something');
    room.id.should.equal('something');
  });

  it('one room per room id', function () {
    var room1 = Room.get('anything');
    var room2 = Room.get('anything');

    room1.should.equal(room2);
  });

  it('sockets can join rooms', function () {
    var room = Room.get('chicken');
    room._join(new Socket());

    room.length().should.equal(1);
  });

  it('sockets can leave rooms', function () {
    var socket = new Socket();

    var room = Room.get('pineapple');
    room.length().should.equal(0);

    room._join(socket);
    room.length().should.equal(1);

    room._leave(socket);
    room.length().should.equal(0);
  });

  it('check if a socket is in a room', function () {
    var room = Room.get('my_room');
    var socket = new Socket();

    room._join(socket);
    room.contains(socket).should.equal(true);

    room._leave(socket);
    room.contains(socket).should.equal(false);
  });

  it('get another room', function () {
    var room1 = Room.get('room1');
    var room2 = Room.get('room2');

    Room.get('room2').should.equal(room2);
  });

  it('emit to all sockets in a room', function () {
    var room = Room.get('special');
    var socket1 = new Socket();
    var socket2 = new Socket();
    var callCount = 0;

    new Socket.listen(function (event) {
      callCount++;
      event.should.equal('hello');
    });

    room._join(socket1);
    room._join(socket2);
    room.length().should.equal(2);

    room.emit('hello');
    callCount.should.equal(2);
  });

  it('broadcast to all sockets in a room', function () {
    var room = Room.get('broadcast');
    var socket1 = new Socket();
    var socket2 = new Socket();
    var sender = new Socket();
    var callCount = 0;

    room._join(socket1);
    room._join(socket2);
    room._join(sender);

    new Socket.listen(function (event) {
      event.should.equal('the_broadcast');
      this.should.not.equal(sender);
      callCount++;
    });

    room.broadcast(sender.id, 'the_broadcast');
    callCount.should.equal(2);
  });

  it('emit to a room from a namespace', function () {
    var room = Room.get('room');
    var socket1 = new Socket();
    var socket2 = new Socket();

    room._join(socket1);
    room._join(socket2);

    var namespace = room.namespace('namespace');
    var callCount = 0;

    new Socket.listen(function (event) {
      event.should.equal('namespace.event');
      callCount++;
    });

    namespace.emit('event');
    callCount.should.equal(2);
  });

  it('broadcast to a room from a namespace', function () {
    var room = Room.get('room');
    var socket1 = new Socket();
    var socket2 = new Socket();
    var socket3 = new Socket();
    var callCount = 0;

    room._join(socket1);
    room._join(socket2);
    room._join(socket3);

    new Socket.listen(function (event) {
      this.should.not.equal(socket1);
      event.should.equal('namespace.event');
      callCount++;
    });

    var namespace = socket1.namespace('namespace');

    namespace.broadcast('event');
    callCount.should.equal(2);

  });

});
