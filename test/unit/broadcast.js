'use strict';

var Broadcast, Room, should;

should = require('should');
Broadcast = require('../../source/broadcast');

Room = {
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

  describe('.attach', function () {

    it('should use the default values', function () {
      var obj;

      obj = {};

      Broadcast.attach(obj);

      obj.should.have.keys('broadcast');
      obj.broadcast.should.have.keys('to');
    });

    it('should use a custom self and method', function () {
      var obj, self;

      obj = { id: 'obj' };
      self = { id: 'self' };

      Broadcast.attach(self, obj, 'thing');

      obj.should.have.keys('id', 'thing');
      self.should.have.keys('id');

      obj.thing('event');
      Room.last.all.should.eql([ 'self', 'event', null, null, null ]);
    });

  });

  describe(':broadcast', function () {

    it('should remember itself', function () {
      var obj;

      obj = { id: 'self' };
      Broadcast.attach(obj);

      obj.broadcast('event', 1, 2, 3);

      Room.last.all.should.eql([ 'self', 'event', 1, 2, 3 ]);
    });

  });

  describe(':broadcastTo', function () {

    it('should broadcast to a room', function () {
      var obj;

      obj = { id: 'self' };
      Broadcast.attach(obj);

      obj.broadcast.to('my_room').emit('event', 1, 2, 3);

      Room.last.my_room.should.eql([ 'self', 'event', 1, 2, 3 ]);
    });

  });

});
