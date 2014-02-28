'use strict';

var should, Room, Broadcast, Socket;

should    = require('should');
Room      = require('../../source/room');
Broadcast = require('../../source/broadcast');
Socket    = require('../fake_socket');

describe('Broadcast', function () {

  beforeEach(function () {
    Broadcast.init(Room);
  });

  afterEach(function () {
    Room.flush();
  });

  it('should put sockets in the all room', function () {
    var sock_1, sock_2, sock_3;

    sock_1 = new Socket();
    sock_2 = new Socket();
    sock_3 = new Socket();

    Room.get('all').length().should.equal(3);
  });

  it('should broadcast to all sockets', function () {
    var sock_1, sock_2, sock_3, callCount;

    sock_1 = new Socket();
    sock_2 = new Socket();
    sock_3 = new Socket();

    new Socket.listen(function (event) {
      event.should.equal('hello');
      this.should.not.equal(sock_1.socket);
      callCount++;
    });

    callCount = 0;
    sock_1.broadcast('hello');
    callCount.should.equal(2);
  });

  it('should broadcast to a room', function () {
    var sock_1, sock_2, sock_3, room, callCount;

    room = Room.get('random');

    sock_1 = new Socket();
    sock_2 = new Socket();
    sock_3 = new Socket();

    sock_1.join('random');
    sock_2.join('random');
    sock_3.join('random');

    room.length().should.equal(3);

    new Socket.listen(function (event) {
      event.should.equal('hello');
      this.should.not.equal(sock_1);
      callCount++;
    });

    callCount = 0;
    sock_1.broadcast.to('random').emit('hello');
    callCount.should.equal(2);
  });

});
