(function () {

  'use strict';

  var jandalHandles;

  /*
   * Can you handle the jandal?
   */

  jandalHandles = {

    node: {
      write: function (socket, message) {
        socket.write(message);
      },
      read: function (socket, fn) {
        socket.on('data', fn);
      },
      close: function (socket, fn) {
        socket.on('close', fn);
      }
    },

    sockjs: {
      write: function (socket, message) {
        socket.send(message);
      },
      read: function (socket, fn) {
        socket.onmessage = function (e) {
          fn(e.data);
        };
      },
      close: function (socket, fn) {
        socket.onclose = fn;
      }
    }

  };

  module.exports = jandalHandles;

}());
