'use strict';

var should, Room, Broadcast, newSocket;

should        = require('should');
Room          = require('../../source/room');
Broadcast     = require('../../source/broadcast');
newSocket     = require('./fake');

describe('Broadcast', function () {

  beforeEach(function () {
    Broadcast.init(Room);
  });

  afterEach(function () {
    Room.flush();
  });

  it('should put sockets in the all room', function () {
    var sock_1, sock_2, sock_3;

    sock_1 = newSocket();
    sock_2 = newSocket();
    sock_3 = newSocket();

    Room.get('all').length().should.equal(3);
  });

  it('should broadcast to all sockets', function () {
    var sock_1, sock_2, sock_3, callCount;

    sock_1 = newSocket();
    sock_2 = newSocket();
    sock_3 = newSocket();

    newSocket.listen(function (event) {
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

    sock_1 = newSocket();
    sock_2 = newSocket();
    sock_3 = newSocket();

    room.join(sock_1);
    room.join(sock_2);
    room.join(sock_3);

    room.length().should.equal(3);

    newSocket.listen(function (event) {
      event.should.equal('hello');
      this.should.not.equal(sock_1);
      callCount++;
    });

    callCount = 0;
    sock_1.broadcast.to('random').emit('hello');
    callCount.should.equal(2);
  });

});
