'use strict';

var Message, regex;

regex = {
  callback: /\.fn\((\d+)\)$/,
  message: /^([^\(]+)\((.*)\)/,
  event: /^[^\(]+$/
};


Message = function (callbacks) {
  this.callbacks = callbacks;
};


/*
 * (private) Parse
 *
 * - message (string)
 * > Message
 */

Message.prototype.parse = function (string) {
  var  event, args, match, callback;
  if (typeof string !== 'string') return false;

  // Match callbacks
  // e.g ".fn(20)"
  match = string.match(regex.callback);
  if (match !== null) {
    callback = match[1];
    string = string.slice(0, match.index);
  }

  // Match a standard message
  // e.g "foo.bar(1,2,3)"
  match = regex.message.exec(string);
  if (match === null) return false;
  args = match[2];

  // Match event
  // e.g. "foo.bar" => ["foo", "bar"]
  match = regex.event.exec(match[1]);
  if (match === null) return false;
  event = match[0];

  // Try parsing arguments as JSON
  try {
    args = JSON.parse('[' + args + ']');
  } catch (e) {
    return false;
  }

  // Add callbacks
  if (callback !== undefined) {
    args.push(this.callbacks.getFn(callback));
  }

  return {
    event: event,
    arg1: args[0],
    arg2: args[1],
    arg3: args[2]
  };
};


/*
 * (private) Serialize
 *
 * Message format
 *
 * - message (object)
 * > string
 */


Message.prototype.serialize = function ( event, arg1, arg2, arg3) {
  var string, args, i, len, arg, callback;

  if (arg1 === undefined && arg2 === undefined && arg3 === undefined) {
    args = [];
  }
  else if (arg2 === undefined && arg3 === undefined) {
    args = [arg1];
  }
  else if (arg3 === undefined) {
    args = [arg1, arg2];
  }
  else {
    args = [arg1, arg2, arg3];
  }

  // Check for a callback
  len = args.length;
  for (i = 0; i < len; i++) {
    arg = args[i];
    if (typeof arg !== 'function') continue;
    if (i === len - 1) {
      callback = this.callbacks.register(arg);
      args.splice(i, 1);
    } else {
      throw new Error('Callback must be the last argument');
    }
  }

  // Convert to string
  args = JSON.stringify(args);

  string = event;

  string += '(' + args.slice(1, -1) + ')';
  if (callback !== undefined) string += '.fn(' + callback + ')';

  return string;
};


module.exports = Message;
