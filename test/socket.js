var Jandal, Socket, createSocket, should;

Jandal = require('../source/jandal');
Socket = require('../source/socket');
Room = require('../source/room');
should = require('should');

// Use node bindings
Jandal.handle('node');

createSocket = function () {
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
    conn = createSocket();
    socket = new Socket(conn);
    Room.flush();
  });

// ----------------------------------------------------------------------------
// CREATING AND READING MESSAGES
// ----------------------------------------------------------------------------

  it('should serialize messages', function () {
    var string;

    string = socket.serialize({
      event: 'test',
      args: ['one', 'two', 'three']
    });
    string.should.equal('test("one","two","three")');
  });

  it('should parse messages', function () {
    var object;

    object = {
      namespace: 'socket',
      event: 'test',
      args: ['one', 'two', 'three']
    };
    socket.parse('socket.test("one","two","three")').should.eql(object);

    object = {
      namespace: false,
      event: 'test',
      args: ['one', 'two', 'three']
    };
    socket.parse('test("one","two","three")').should.eql(object);
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
    var total;

    socket.on('newListener', function () {
      total = arguments.length;
    });

    total = 0;
    socket.on('should trigger newListener', function () {});
    total.should.equal(2);

    total = 0;
    socket.emit('newListener', 'randomEvent', function () {});
    total.should.equal(2);

    should.strictEqual(conn.last, null);
  });


// ----------------------------------------------------------------------------
// NAMESPACES
// ----------------------------------------------------------------------------

  it('should create namespaces', function () {

    var shoe;

    shoe = socket.namespace('shoe');

    // Should re-use the same namespace
    shoe.should.equal(socket.namespace('shoe'));
  });

  it('should prefix namespaced events', function () {

    var shoe;

    shoe = socket.namespace('shoe');

    shoe.emit('event', 'hello', 'world');
    expect('shoe.event("hello","world")');

    shoe.emit('no_args');
    expect('shoe.no_args()');
  });

  it('should respond to namespaced events', function () {

    var shoe, total;

    shoe = socket.namespace('shoe');

    shoe.on('event', function () {
      total = arguments.length;
    });

    total = -1;
    conn.reply('shoe.event({"pretty":"neat"})');
    total.should.equal(1);

    total = -1;
    conn.reply('shoe.event("hello","world")');
    total.should.equal(2);
  });

  it('should not mix events between namespaces', function () {

    var shoe, sandal, total, type;

    shoe = socket.namespace('shoe');
    sandal = socket.namespace('sandal');

    socket.on('event', function () {
      total = arguments.length;
      type = 'socket';
    });

    shoe.on('event', function () {
      total = arguments.length;
      type = 'shoe';
    });

    sandal.on('event', function () {
      total = arguments.length;
      type = 'sandal';
    });

    total = -1;
    type = '';
    conn.reply('event("test")');
    total.should.equal(1);
    type.should.equal('socket');

    total = -1;
    type = '';
    conn.reply('shoe.event("test", "thing")');
    total.should.equal(2);
    type.should.equal('shoe');

    total = -1;
    type = '';
    conn.reply('sandal.event(["test", "thing"],"hello")');
    total.should.equal(2);
    type.should.equal('sandal');
  });


// ----------------------------------------------------------------------------
// CALLBACKS
// ----------------------------------------------------------------------------

  it('should convert functions into callback handlers', function () {

    var fn;

    fn = function () { };

    socket.emit('event', fn);
    expect('event("__fn__0")');

    socket.emit('event', fn);
    expect('event("__fn__1")');

  });

  it('should trigger callbacks', function () {

    socket.on('event', function (callback) {
      callback.should.have.type('function');
      callback();
    });

    conn.reply('event("__fn__20")');
    expect('__fn__20()');

  });

  it('should trigger callback with arguments', function () {

    socket.on('event', function (callback) {
      callback('hello', 'world');
    });

    conn.reply('event("__fn__101")');
    expect('__fn__101("hello","world")');

  });

  it('should run callbacks', function (done) {

    var fn;

    fn = function (a, b) {
      a.should.equal('some');
      b.should.equal('arguments');
      done();
    };

    socket.emit('event', fn);

    conn.reply('__fn__0("some","arguments")');

  });


// ----------------------------------------------------------------------------
// ROOMS
// ----------------------------------------------------------------------------

  it('should join a room', function () {
    socket.join('my_room');
    Socket.in('my_room').length().should.equal(1);
  });

  it('should leave a room', function () {
    socket.join('my_room');
    socket.leave('my_room');
    Socket.in('my_room').length().should.equal(0);
  });

});
