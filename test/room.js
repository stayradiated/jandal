var should, Room, emit, newSocket, socketId;

should = require('should');
Room = require('../source/room');

socketId = -1;

newSocket = function () {
  return {
    id: ++socketId,
    emit: function () {
      emit.apply(this, arguments);
    }
  };
};

describe('Room', function () {

  beforeEach(function () {

    // Destroy all rooms
    Room.flush();

    // Override this to handle emitting
    emit = function () {
      console.log(arguments);
    };

  });

  it('can create rooms', function () {
    var room;

    room = Room.get('something');
    room.id.should.equal('something');
  });

  it('one room per room id', function () {
    var room1, room2;

    room1 = Room.get('anything');
    room2 = Room.get('anything');

    room1.should.equal(room2);
  });

  it('can destroy rooms', function () {
    var room;

    room = Room.get('thing');
    Room.rooms.should.have.keys('thing');

    Room.remove('thing');
    Room.rooms.should.not.have.keys('thing');

    room = Room.get('odd');
    Room.rooms.should.have.keys('odd');

    room.destroy();
    Room.rooms.should.not.have.keys('odd');

  });

  it('sockets can join rooms', function () {
    var room;

    room = Room.get('chicken');
    room.join(newSocket());

    room.length().should.equal(1);
  });

  it('sockets can leave rooms', function () {
    var room, socket;
    socket = newSocket();

    room = Room.get('pineapple');
    room.length().should.equal(0);

    room.join(socket);
    room.length().should.equal(1);

    room.leave(socket);
    room.length().should.equal(0);
  });

  it('check if a socket is in a room', function () {
    var room, socket;

    room = Room.get('my_room');
    socket = newSocket();

    room.join(socket);
    room.contains(socket).should.equal(true);

    room.leave(socket);
    room.contains(socket).should.equal(false);
  });

  it('get another room', function () {
    var room1, room2;

    room1 = Room.get('room1');
    room2 = Room.get('room2');

    room1.in('room2').should.equal(room2);
  });

  it('emit to all sockets in a room', function () {
    var room, socket1, socket2, callCount;

    room = Room.get('special');
    socket1 = newSocket();
    socket2 = newSocket();
    callCount = 0;

    emit = function (event) {
      callCount++;
      event.should.equal('hello');
    };

    room.join(socket1);
    room.join(socket2);
    room.length().should.equal(2);

    room.emit('hello');
    callCount.should.equal(2);
  });

  it('broadcast to all sockets in a room', function () {
    var room, socket1, socket2, sender, callCount;

    room = Room.get('broadcast');
    socket1 = newSocket();
    socket2 = newSocket();
    sender = newSocket();
    callCount = 0;

    room.join(socket1);
    room.join(socket2);
    room.join(sender);

    emit = function (event) {
      event.should.equal('the_broadcast');
      this.should.not.equal(sender);
      callCount++;
    };

    room.broadcast(sender, 'the_broadcast');
    callCount.should.equal(2);
  });

  it('emit to a room from a namespace', function () {
    var room, socket1, socket2, namespace, callCount;

    room = Room.get('room');
    socket1 = newSocket();
    socket2 = newSocket();
    room.join(socket1);
    room.join(socket2);
    namespace = room.namespace('namespace');
    callCount = 0;

    emit = function (event) {
      event.should.equal('namespace.event');
      callCount++;
    };

    namespace.emit('event');
    callCount.should.equal(2);
  });

});
