'use strict';

var should = require('should');
var Broadcast = require('../../source/broadcast');

var Room = {
  last: {},
  get: function (name) {
    return {
      id: name,
      broadcast: function (sender, event, a1, a2, a3) {
        Room.last[name] = [sender, event, a1, a2, a3];
      }
    };
  }
};

describe('Broadcast', function () {

  before(function () {
    Broadcast.init(Room);
  });

  describe('.bind', function () {

    it('should bind to obj', function () {
      var obj = {};

      var broadcast = Broadcast.bind(obj);

      broadcast.should.have.type('function');
      broadcast.to.should.have.type('function');
    });

  });

  describe(':broadcast', function () {

    it('should remember itself', function () {
      var obj = { id: 'self' };
      var broadcast = Broadcast.bind(obj);

      broadcast('event', 1, 2, 3);
      Room.last.all.should.eql([ 'self', 'event', 1, 2, 3 ]);
    });

  });

  describe(':broadcastTo', function () {

    it('should broadcast to a room', function () {
      var obj = { id: 'self' };
      var broadcast = Broadcast.bind(obj);

      broadcast.to('my_room').emit('event', 1, 2, 3);

      Room.last.my_room.should.eql([ 'self', 'event', 1, 2, 3 ]);
    });

  });

});
