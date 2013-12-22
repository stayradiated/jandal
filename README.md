Jandal
======

Event handler for [SockJS](https://github.com/sockjs/sockjs-node).

## How it's going to work

The idea is that we have a standard [EventEmitter](http://nodejs.org/api/events.html#events_class_events_eventemitter) handling the events, and that we serialize the information as text in the following way:

    <namespace>.<event>(<args>)

I think this keeps messages short, simple and easy to read. Compare it something that uses JSON objects:

    {"<namespace>":{"event":"<event>","args":[<args>]}}
