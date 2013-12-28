var broadcast, Room, should, emit, socketId, newSocket;

broadcastFrom = require('../source/broadcast');
Room = require('../source/room');
should = require('should');

socketId = -1;
newSocket = function () {
  var socket = {
    id: ++socketId,
    emit: function () {
      emit.apply(this, arguments);
    }
  };
  broadcastFrom(socket);
  Room.get('all').join(socket);
  return socket;
};

describe('Broadcast', function () {

  beforeEach(function () {
    // Flush rooms
    Room.flush();

    // Setup broadcast
    broadcastFrom.init(Room);

    // Override this function
    emit = function () {
      console.log(arguments);
    };
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

    emit = function (event) {
      event.should.equal('hello');
      this.should.not.equal(sock_1);
      callCount++;
    };

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

    emit = function (event) {
      event.should.equal('hello');
      this.should.not.equal(sock_1);
      callCount++;
    };

    callCount = 0;
    sock_1.broadcast.to('random').emit('hello');
    callCount.should.equal(2);
  });

});
