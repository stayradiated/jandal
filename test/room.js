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

  it('should add to room', function () {
    var room;

    room = Room.get('chicken');
    room.join(newSocket());

    room.length().should.equal(1);

  });

});
