'use strict';

var should, Socket, Room, Connection, handle;

should = require('should');
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
  
  var conn, socket;

  before(function () {
    Socket.all = Room.get('all');
  });

  beforeEach(function () {
    Room.get('all').empty();
    conn = new Connection();
    socket = new Socket(conn, handle);
  });

  describe('.all', function () {
  });

  describe('.in', function () {
  });

  describe(':constructor', function () {

    it('should create a new Socket', function () {
      socket.rooms.should.be.an.instanceOf(Array);
      socket.broadcast.should.have.type('function');
      Socket.all.length().should.equal(1);
    });

  });

  describe(':_process', function () {

    it('should pass args with the event', function () {
      var data;

      conn.once('message', function (event, arg1, arg2) {
        event.should.equal('fn');
        arg1.should.equal('run');
        should.equal(undefined, arg2);
      });

      data = 'fn("run")';
      socket._process(data);

    });

    it('should emit to namespaces as well', function () {
      var data;

      conn.once('message', function(event, arg) {
      });

    });

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
