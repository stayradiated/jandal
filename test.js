var Jandal, createSocket, should;

Jandal = require('./source/jandal');
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

describe('Jandal', function () {

  var socket, jandal, expect;

  expect = function (string) {
    socket.last.should.equal(string);
  };

  beforeEach(function () {
    socket = createSocket();
    jandal = new Jandal(socket);
  });


// ----------------------------------------------------------------------------
// CREATING AND READING MESSAGES
// ----------------------------------------------------------------------------

  it('should serialize messages', function () {
    var string;

    string = jandal.serialize({
      event: 'test',
      args: ['one', 'two', 'three']
    });
    string.should.equal('test("one","two","three")');

  });

  it('should parse messages', function () {
    var object;

    object = {
      namespace: 'jandal',
      event: 'test',
      args: ['one', 'two', 'three']
    };
    jandal.parse('jandal.test("one","two","three")').should.eql(object);

    object = {
      namespace: false,
      event: 'test',
      args: ['one', 'two', 'three']
    };
    jandal.parse('test("one","two","three")').should.eql(object);

  });


// ----------------------------------------------------------------------------
// EVENTS
// ----------------------------------------------------------------------------

  it('should register a listener for the "data" event on instantiation', function () {
    socket.reply.should.have.type('function');
  });

  it('should expose some EventEmitter methods via on() and _emit()', function () {

    var total = 0;

    jandal.on('event with a few arguments', function (a, b, c) {
      a.should.equal('one');
      b.should.equal('two');
      c.should.equal('three');
      total = arguments.length;
    });

    jandal._emit('event with a few arguments', 'one', 'two', 'three');

    total.should.equal(3);
    should.strictEqual(socket.last, null);

  });

  it('should proxy native EventEmitter events', function () {

    var total;

    jandal.on('newListener', function () {
      total = arguments.length;
    });

    total = 0;
    jandal.on('should trigger newListener', function () {});
    total.should.equal(2);

    total = 0;
    jandal.emit('newListener', 'randomEvent', function () {});
    total.should.equal(2);

    should.strictEqual(socket.last, null);

  });


// ----------------------------------------------------------------------------
// GLOBAL EVENTS
// ----------------------------------------------------------------------------

  it('should emit global events', function () {

    jandal.emit('event');
    expect('event()');

    jandal.emit('special_symbols');
    expect('special_symbols()');

    jandal.emit('CapitalLetters');
    expect('CapitalLetters()');

    jandal.emit('and spaces');
    expect('and spaces()');

  });

  it('should emit global events with arguments', function () {

    jandal.emit('event', 'test');
    expect('event("test")');

    jandal.emit('event', 'with', 'lots', 'of', 'strings');
    expect('event("with","lots","of","strings")');

    jandal.emit('event', {object: {test: true}});
    expect('event({"object":{"test":true}})');

    jandal.emit('event', ['ok', 'go']);
    expect('event(["ok","go"])');

  });


  it('should respond to global events', function () {

    var total;

    jandal.on('event', function () {
      total = arguments.length;
    });

    total = -1;
    socket.reply('event("one","two")');
    total.should.equal(2);

    total = -1;
    socket.reply('event()');
    total.should.equal(0);

  });


// ----------------------------------------------------------------------------
// NAMESPACES
// ----------------------------------------------------------------------------

  it('should create namespaces', function () {

    var shoe;

    shoe = jandal.namespace('shoe');

    // Should re-use the same namespace
    shoe.should.equal(jandal.namespace('shoe'));

  });

  it('should prefix namespaced events', function () {

    var shoe;

    shoe = jandal.namespace('shoe');

    shoe.emit('event', 'hello', 'world');
    expect('shoe.event("hello","world")');

    shoe.emit('no_args');
    expect('shoe.no_args()');

  });

  it('should respond to namespaced events', function () {

    var shoe, total;

    shoe = jandal.namespace('shoe');

    shoe.on('event', function () {
      total = arguments.length;
    });

    total = -1;
    socket.reply('shoe.event({"pretty":"neat"})');
    total.should.equal(1);

    total = -1;
    socket.reply('shoe.event("hello","world")');
    total.should.equal(2);

  });

  it('should not mix events between namespaces', function () {

    var shoe, sandal, total, type;

    shoe = jandal.namespace('shoe');
    sandal = jandal.namespace('sandal');

    jandal.on('event', function () {
      total = arguments.length;
      type = 'jandal';
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
    socket.reply('event("test")');
    total.should.equal(1);
    type.should.equal('jandal');

    total = -1;
    type = '';
    socket.reply('shoe.event("test", "thing")');
    total.should.equal(2);
    type.should.equal('shoe');

    total = -1;
    type = '';
    socket.reply('sandal.event(["test", "thing"],"hello")');
    total.should.equal(2);
    type.should.equal('sandal');

  });

// ----------------------------------------------------------------------------
// CALLBACKS
// ----------------------------------------------------------------------------

  it('should convert functions into callback handlers', function () {

    var fn;

    fn = function () { };

    jandal.emit('event', fn);
    expect('event("__fn__0")');

    jandal.emit('event', fn);
    expect('event("__fn__1")');

  });

  it('should trigger callbacks', function () {

    jandal.on('event', function (callback) {
      callback.should.have.type('function');
      callback();
    });

    socket.reply('event("__fn__20")');
    expect('__fn__20()');

  });

  it('should trigger callback with arguments', function () {

    jandal.on('event', function (callback) {
      callback('hello', 'world');
    });

    socket.reply('event("__fn__101")');
    expect('__fn__101("hello","world")');

  });

  it('should run callbacks', function (done) {

    var fn;

    fn = function (a, b) {
      a.should.equal('some');
      b.should.equal('arguments');
      done();
    };

    jandal.emit('event', fn);

    socket.reply('__fn__0("some","arguments")');

  });


});
