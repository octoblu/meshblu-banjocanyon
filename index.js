'use strict';
var util = require('util');
var net = require('net');
var _ = require('lodash');
var EventEmitter = require('events').EventEmitter;
var defaultOptions = { port: 5558 };

var MESSAGE_SCHEMA = {
  type: 'object',
  properties: {
    exampleBoolean: {
      type: 'boolean',
      required: true
    },
    exampleString: {
      type: 'string',
      required: true
    }
  }
};

var OPTIONS_SCHEMA = {
  type: 'object',
  properties: {
    firstExampleOption: {
      type: 'string',
      required: true
    }
  }
};

function Plugin(){
  this.options = defaultOptions;
  this.messageSchema = MESSAGE_SCHEMA;
  this.optionsSchema = OPTIONS_SCHEMA;
  return this;
}
util.inherits(Plugin, EventEmitter);

Plugin.prototype.onMessage = function(message){
  var payload = message.payload, self = this;
  this.emit('message', { devices: ['*'], topic: 'echo', payload: payload });
  var connection = net.connect(self.options, function(){
    self.sendMessage( message, connection );
  });
};


Plugin.prototype.sendMessage = function(message, connection) {
  connection.write(JSON.stringify({"cmd" : "data_input", "data" : message}));
  connection.end();  
} 


Plugin.prototype.onConfig = function(device){
  var self = this;
  self.setOptions(defaultOptions);
};

Plugin.prototype.setOptions = function(options){
  this.options = options;
};

module.exports = {
  messageSchema: MESSAGE_SCHEMA,
  optionsSchema: OPTIONS_SCHEMA,
  Plugin: Plugin
};
