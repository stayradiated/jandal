(function () {

  'use strict';

  var Socket, handles;

  /*
   * Dependencies
   */

  Socket = require('./socket');
  handles = require('./handles');


  /*
   * (Static) Handle
   * Choose how to attach to the socket
   *
   * - name (string) : a key from handles (currently 'node' or 'sockjs')
   * - name (object) : a handle in the form of
   *   {
   *     open: fn(socket, fn),
   *     close: fn(socket, fn),
   *     read: fn(socket, fn),
   *     error: fn(socket, fn),
   *     write: fn(socket, message)
   *   }
   */

  Socket.handle = function (name) {
    if (typeof name === 'object') {
      Socket._handle = name;
    } else {
      var handle = handles[name];
      if (! handle) {
        throw new Error('Jandal handler "' + name + '"could not be found');
      }
      Socket._handle = handle;
    }
  };

  module.exports = Socket;

}());
