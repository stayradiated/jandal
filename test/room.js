var should, Room, newSocket, socketId;

should = require('should');
Room = require('../source/room');

socketId = -1;

newSocket = function () {
  return {
    id: ++socketId
  };
};

describe('Room', function () {

  beforeEach(function () {
    Room.flush();
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

});
