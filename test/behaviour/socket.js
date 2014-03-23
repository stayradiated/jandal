'use strict';

var Jandal = require('../../index');
var Socket = require('../../source/socket');
var Room = require('../../source/room');
var should = require('should');

var createSocket = function () {
  return {
    last: null,
    reply: null,
    on: function (name, callback) {
      if (name != 'data') return;
      this.reply = callback;
    },
    write: function (string) {
      this.last = string;
    }
  };
};

describe('Socket', function () {

  var conn, socket, expect;

  expect = function (string) {
    conn.last.should.equal(string);
  };

  beforeEach(function () {
    Room.flush();
    conn = createSocket();
    socket = new Socket(conn, 'stream');
  });

// ----------------------------------------------------------------------------
// EVENTS
// ----------------------------------------------------------------------------

  it('should register a listener for the "data" event on instantiation', function () {
    conn.reply.should.have.type('function');
  });

  it('should expose some EventEmitter methods via on() and _emit()', function () {
    var total = 0;

    socket.on('event with a few arguments', function (a, b, c) {
      a.should.equal('one');
      b.should.equal('two');
      c.should.equal('three');
      total = arguments.length;
    });

    socket._emit('event with a few arguments', 'one', 'two', 'three');

    total.should.equal(3);
    should.strictEqual(conn.last, null);
  });

  it('should proxy native EventEmitter events', function () {

    socket.on('newListener', function (event, fn) {
      event.should.have.type('string');
      fn.should.have.type('function');
    });

    socket.on('should trigger newListener', function () {});
    socket.emit('newListener', 'randomEvent', function () {});
    should.strictEqual(conn.last, null);
  });


// ----------------------------------------------------------------------------
// NAMESPACES
// ----------------------------------------------------------------------------

  it('should create namespaces', function () {
    var shoe = socket.namespace('shoe');

    // Should re-use the same namespace
    shoe.should.equal(socket.namespace('shoe'));
  });

  it('should prefix namespaced events', function () {
    var shoe = socket.namespace('shoe');

    shoe.emit('event', 'hello', 'world');
    expect('shoe.event("hello","world")');

    shoe.emit('no_args');
    expect('shoe.no_args()');
  });

  it('should respond to namespaced events', function () {
    var shoe = socket.namespace('shoe');

    shoe.on('event', function (a, b) {
      a.should.have.type('string');
      b.should.have.type('string');
    });

    conn.reply('shoe.event("thats","odd")');
    conn.reply('shoe.event("hello","world")');
  });

  it('should not mix events between namespaces', function () {
    var shoe = socket.namespace('shoe');
    var sandal = socket.namespace('sandal');

    socket.on('event', function () {
      type = 'socket';
    });

    shoe.on('event', function () {
      type = 'shoe';
    });

    sandal.on('event', function () {
      type = 'sandal';
    });

    var type = '';
    conn.reply('event("test")');
    type.should.equal('socket');

    type = '';
    conn.reply('shoe.event("test", "thing")');
    type.should.equal('shoe');

    type = '';
    conn.reply('sandal.event(["test", "thing"],"hello")');
    type.should.equal('sandal');
  });


// ----------------------------------------------------------------------------
// CALLBACKS
// ----------------------------------------------------------------------------

  it('should convert functions into callback handlers', function () {
    var fn = function () { };

    socket.emit('event', fn);
    expect('event().fn(0)');

    socket.emit('event', fn);
    expect('event().fn(1)');
  });

  it('should trigger callbacks', function () {
    socket.on('event', function (callback) {
      callback.should.have.type('function');
      callback();
    });

    conn.reply('event().fn(20)');
    expect('socket.fn_20()');
  });

  it('should trigger callback with arguments', function () {
    socket.on('event', function (callback) {
      callback('hello', 'world');
    });

    conn.reply('event().fn(10)');
    expect('socket.fn_10("hello","world")');
  });

  it('should run callbacks', function (done) {
    var fn = function (a, b) {
      a.should.equal('some');
      b.should.equal('arguments');
      done();
    };

    socket.emit('event', fn);
    conn.reply('socket.fn_0("some","arguments")');
  });


// ----------------------------------------------------------------------------
// ROOMS
// ----------------------------------------------------------------------------

  it('should join a room', function () {
    socket.join('my_room');
    socket.room('my_room').length().should.equal(1);
    socket.rooms.should.eql(['all', 'my_room']);
  });

  it('should leave a room', function () {
    socket.join('my_room');
    socket.leave('my_room');
    socket.room('my_room').length().should.equal(0);
    socket.rooms.should.eql(['all']);
  });

});

