'use strict';
var util           = require('util');
var net            = require('net');
var _              = require('lodash');
var debug          = require('debug')('meshblu-banjocanyon');
var EventEmitter   = require('events').EventEmitter;
var defaultOptions = { port: 5558 };

var MESSAGE_SCHEMA = {
  type: 'object',
  properties: {}
};

var OPTIONS_SCHEMA = {
  type: 'object',
  properties: {
    port: {
      type: 'number',
      default: defaultOptions.port,
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
  debug('sending message to banjocanyon', message);
  var payload = message.payload, self = this;
  var connection = net.connect(self.options, function() {
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
  if(self.socket) {
    self.socket.close();
  }
  self.socket = self.createBanjoCanyonSocket();
};


Plugin.prototype.createBanjoCanyonSocket = function(){
  var self = this;
  self.socket = net.connect(self.options);
  self.socket.on('data', function(messageBuffer){
    var messageString = messageBuffer.toString();
    debug('message from banjocanyon', messageString);
    try {
     self.emit('message', { devices: ['*'], topic: 'message', payload: JSON.parse(messageString) });
    } catch(e) {
      debug('Failed to parse message', messageString);
    }
  });
};

Plugin.prototype.setOptions = function(options){
  this.options = options;
};

module.exports = {
  messageSchema: MESSAGE_SCHEMA,
  optionsSchema: OPTIONS_SCHEMA,
  Plugin: Plugin
};
