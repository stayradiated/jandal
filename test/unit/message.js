'use strict';

var should = require('should');
var Message = require('../../source/message');

var callbacks = {
  fn: function () {},
  register: function () {
    return 0;
  },
  getFn: function () {
    return callbacks.fn;
  }
};

describe('Message', function () {

  describe(':constructor', function () {
  });

  describe(':toString', function () {

    var message;

    before(function () {
      message = new Message(callbacks);
    });

    it('should serialize messages', function () {

      var string = message.serialize('test', 'one', 'two', 'three');
      string.should.equal('test("one","two","three")');

      string = message.serialize('test', 'one', function () {});
      string.should.equal('test("one").fn(0)');

      string = message.serialize(
        'something.amazing', ['woo', 'loo'], {oh: 'yeah'}, function () {}
      );
      string.should.equal('something.amazing(["woo","loo"],{"oh":"yeah"}).fn(0)');
    });

  });

  describe(':parse', function () {
    var message;

    before(function () {
      message = new Message(callbacks);
    });

    it('should parse messages', function () {

      var string = 'socket.test("one","two","three")';

      message.parse(string).should.eql({
        event: 'socket.test',
        arg1: 'one',
        arg2: 'two',
        arg3: 'three'
      });

      string = 'test("one","two")';
      message.parse(string).should.eql({
        event: 'test',
        arg1: 'one',
        arg2: 'two',
        arg3: undefined
      });

      string = 'test().fn(0)';
      message.parse(string).should.eql({
        event: 'test',
        arg1: callbacks.fn,
        arg2: undefined,
        arg3: undefined
      });

      string = 'test("arg1").fn(0)';
      message.parse(string).should.eql({
        event: 'test',
        arg1: 'arg1',
        arg2: callbacks.fn,
        arg3: undefined
      });

    });

    it('should handle invalid messages', function () {

      var string = 'socket.test(one,two,three)';
      message.parse(string).should.equal(false);

      string = 'foo bar';
      message.parse(string).should.equal(false);

      string = 'not.a.message';
      message.parse(string).should.equal(false);

      string = 'what_could ({happen:20}).fn( 2 )';
      message.parse(string).should.equal(false);

      string = '()';
      message.parse(string).should.equal(false);

      string = 2;
      message.parse(string).should.equal(false);

      string = undefined;
      message.parse(string).should.equal(false);

    });

  });
});
