var Jandal, Socket, createSocket, should;

Jandal = require('../source/jandal');
Socket = require('../source/socket');
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


});
