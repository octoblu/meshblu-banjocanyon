var net = require('net');
var _ = require('lodash');

var connection, throttledSendMessage;
var options = { port: 5558 };

throttledSendMessage = _.throttle(sendMessage, 1000);

function sendMessage() {
  console.log('connected');
  console.log('writing');
  connection.write(JSON.stringify({"cmd" : "data_input", "data" : { test: Math.random() * 1000 }}));
  connection.end();
  console.log('connection closed');
  connection = net.connect(options, throttledSendMessage);
} 

connection = net.connect(options, throttledSendMessage);