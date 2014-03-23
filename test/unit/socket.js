'use strict';

var should = require('should');
var Socket = require('../../source/socket');
var Room = require('../../source/room');
var Connection = require('events').EventEmitter;

var handle = {
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
  release: function (socket) {
    socket.removeAllListeners('message');
    socket.removeAllListeners('error');
    socket.removeAllListeners('open');
    socket.removeAllListeners('close');
  }
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

    it('should contain all connected sockets', function () {
      Socket.all.length().should.equal(1);
      Socket.all.id.should.equal('all');
      Socket.all.sockets.should.eql([ socket ]);

      socket.release();
      Socket.all.length().should.equal(0);
    });

  });

  describe('.in', function () {

    it('should get the "all" room', function () {
      Socket.in('all').should.equal(Socket.all);
    });

    it('should get a custom room', function () {
      Socket.in('test').length().should.equal(0);
      socket.join('test');
      Socket.in('test').length().should.equal(1);
    });

  });

  describe(':constructor', function () {

    it('should create a new Socket', function () {
      socket.rooms.should.be.an.instanceOf(Array);
      socket.broadcast.should.have.type('function');
      Socket.all.length().should.equal(1);
    });

  });

  describe(':_process', function () {

    it('should pass args with the event', function (done) {
      socket.once('fn', function (arg1, arg2, arg3) {
        arg1.should.equal('a');
        arg2.should.equal('b');
        arg3.should.equal('c');
        done();
      });

      var data = 'fn("a", "b", "c")';
      socket._process(data);

    });

    it('should emit namespaces as events', function (done) {
      socket.once('ns.fn', function(arg1, arg2, arg3) {
        arg1.should.equal('a');
        arg2.should.equal('b');
        arg3.should.equal('c');
        done();
      });

      var data = 'ns.fn("a", "b", "c")';
      socket._process(data);

    });


    it('should emit to namespaces', function (done) {
      socket.namespace('ns').once('fn', function(arg1, arg2, arg3) {
        arg1.should.equal('a');
        arg2.should.equal('b');
        arg3.should.equal('c');
        done();
      });

      var data = 'ns.fn("a", "b", "c")';
      socket._process(data);

    });

  });

  describe(':_handleWith', function () {

    it('should set _handle', function () {
      socket._handle.should.equal(handle);

      socket._handleWith('stream');
      var stream = socket._handle;
      stream.should.not.equal(handle);
      stream.should.have.type('object');

      socket._handleWith('websocket');
      var websocket = socket._handle;
      websocket.should.not.equal(stream);
      websocket.should.have.type('object');
    });

  });

  describe(':connect', function () {

    it('should bind socket with handler', function () {

      // socket.connect() is run in the constrsuctor
      // if a socket connection is passed in

      socket.socket.should.equal(conn);
      socket.id.should.equal(handle.identify(conn));

      conn.listeners('message').should.have.length(1);
      conn.listeners('error').should.have.length(1);
      conn.listeners('open').should.have.length(1);
      conn.listeners('close').should.have.length(1);

    });

  });

  describe(':namespace', function () {

    it('should get a namespace', function (done) {
      var ns = socket.namespace('name');

      ns.name.should.equal('name');
      ns.item.should.equal(socket);

      ns.on('event', function (arg1, arg2, arg3) {
        arg1.should.equal('a');
        arg2.should.equal('b');
        arg3.should.equal('c');
        done();
      });

      socket.emit('name.event', 'a', 'b', 'c');
    });

  });

  describe(':emit', function () {

    it('should emit a message', function (done) {

      conn.on('message', function (message) {
        message.should.equal('event("arg1",2,[3])');
        done();
      });

      socket.emit('event', 'arg1', 2, [3]);

    });

  });

  describe(':join', function () {

    it('should join a room', function () {

      socket.rooms.should.eql([ 'all' ]);
      Socket.in('room').length().should.equal(0);

      socket.join('room');
      socket.rooms.should.eql([ 'all', 'room' ]);
      Socket.in('room').length().should.equal(1);

    });

  });

  describe(':leave', function () {

    it('should leave a room', function () {

      socket.join('room');
      socket.rooms.should.eql([ 'all', 'room' ]);

      socket.leave('room');
      socket.rooms.should.eql([ 'all' ]);

    });

  });

  describe(':room', function () {

    it('should be the same as Socket.in', function () {
      socket.room.should.equal(Socket.in);
    });

    it('should get a room', function () {
      socket.room('all').should.equal(Socket.all);
      socket.room('room').should.equal(Socket.in('room'));
    });

  });

  describe(':release', function () {

    it('should remove from all rooms', function () {

      Socket.all.length().should.equal(1);
      socket.rooms.should.eql([ 'all' ]);

      socket.release();

      Socket.all.length().should.equal(0);
      should.equal(undefined, socket.rooms);

    });

  });

});
