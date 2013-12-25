(function () {

  'use strict';

  var Room;


  /*
   * Room Constructor
   */

  Room = function (id) {
    this.id = id;
    this.sockets = [];
  };

  Room.rooms = {};

  Room.get = function (id) {
  };

  Room.remove = function (id) {
  };

  Room.flush = function () {
  };

  Room.prototype.join = function (socket) {
  };

  Room.prototype.leave = function (socket) {
  };

  Room.prototype.length = function () {
  };

  Room.prototype.emit = function (event, args) {
  };

  Room.prototype.namespace = function (name) {
  };

  Room.prototype.broadcast = function (sender, events, args) {
  };

  Room.prototype.in = function (id) {
  };

  Room.prototype.contains = function (socket) {
  };


  module.exports = Room;

}());
