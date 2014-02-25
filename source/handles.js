(function () {

  'use strict';

  var jandalHandles, websocketsId;
  websocketsId = 0;

  /*
   * Can you handle the jandal?
   */

  jandalHandles = {

    node: {
      identify: function (socket) {
        return socket.id;
      },
      write: function (socket, message) {
        socket.write(message);
      },
      onread: function (socket, fn) {
        socket.on('data', fn);
      },
      onclose: function (socket, fn) {
        socket.on('close', fn);
      },
      onerror: function(socket, fn) {
        socket.on('error', fn);
      },
      onopen: function(socket, fn) {
        setTimeout(fn, 0);
      }
    },

    websockets: {
      identify: function (socket) {
        return socket.id || socket.id = ++websocketsId;
      },
      write: function (socket, message) {
        socket.send(message);
      },
      onread: function (socket, fn) {
        socket.onmessage = function (e) { fn(e.data); };
      },
      onclose: function (socket, fn) {
        socket.onclose = fn;
      },
      onerror: function(socket, fn) {
        socket.onerror = fn;
      },
      onopen: function(socket, fn) {
        socket.onopen = fn;
      }
    }

  };

  module.exports = jandalHandles;

}());
