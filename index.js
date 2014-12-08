'use strict';
var util = require('util');
var net = require('net');
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
  this.options = {};
  this.messageSchema = MESSAGE_SCHEMA;
  this.optionsSchema = OPTIONS_SCHEMA;
  return this;
}
util.inherits(Plugin, EventEmitter);

Plugin.prototype.onMessage = function(message){
  var payload = message.payload;
  this.emit('message', { devices: ['*'], topic: 'echo', payload: payload });
  
  if (this.banjoConnection) {
    this.banjoConnection.write( JSON.stringify( {"cmd" : "data_input", "data" : payload} ) );
  }

};

Plugin.prototype.onConfig = function(device){
  var self = this;
  self.setOptions(device.options || defaultOptions);
  
  if( self.banjoConnection ) {
    self.banjoConnection.close();
  }

  self.banjoConnection = net.connect(self.options);
};

Plugin.prototype.setOptions = function(options){
  this.options = options;
};

module.exports = {
  messageSchema: MESSAGE_SCHEMA,
  optionsSchema: OPTIONS_SCHEMA,
  Plugin: Plugin
};
