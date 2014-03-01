'use strict';

var Socket, Room, Connection, handle;

Socket = require('../../source/socket');
Room = require('../../source/room');
Connection = require('events').EventEmitter;

handle = {
  identify: function (socket) {
    return socket;
  },
  write: function (socket, message) {
    socket.emit('message', message);
  },
  onread: function (socket, fn) {
    socket.on('message', fn);
  },
  onerror: function (socket, fn) {
    socket.on('error', fn);
  },
  onopen: function (socket, fn) {
    socket.on('open', fn);
  },
  onclose: function (socket, fn) {
    socket.on('close', fn);
  },
};

describe('Socket', function () {

  before(function () {
    Socket.all = Room.get('all');
  });

  beforeEach(function () {
    Room.get('all').empty();
  });

  describe('.all', function () {
  });

  describe('.in', function () {
  });

  describe(':constructor', function () {

    it('should create a new Socket', function () {
      var conn, socket;
      Socket.all.length().should.equal(0);
      conn = new Connection();
      socket = new Socket(conn, handle);
      socket.rooms.should.be.an.instanceOf(Array);
      socket.broadcast.should.have.type('function');
      Socket.all.length().should.equal(1);
    });

  });

  describe(':_process', function () {
  });

  describe(':_handleWith', function () {
  });

  describe(':connect', function () {
  });

  describe(':namespace', function () {
  });

  describe(':emit', function () {
  });

  describe(':join', function () {
  });

  describe(':leave', function () {
  });

  describe(':room', function () {
  });

  describe(':release', function () {
  });

});
