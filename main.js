//
// This is main file containing code implementing the Express server and functionality for the Express echo bot.
// Archivo principal que contiene el codigo que invoca el servidor Express y las funcionalidades del bot "eco"
//

'use strict';
// We have to declare the modules we are gonna use in this file.
// Declaramos lo modulos que usaremos en este archivo

// NPM modules
const express = require('express');
const bodyParser = require('body-parser');
const request = require('request');
const path = require('path');

// My modules
const send = require('./handlers/send.js');
const RM = require('./listeners/receivedMessage.js')
const RP = require('./listeners/receivedPostback.js')
var messengerButton = require('./listeners/index.js');


// The rest of the code implements the routes for our Express server.
let app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}));

// Display the web page
// Muestra la pagina de esta app. En este caso es en el endpoint
//      https://lucky-attempt.glitch.me/
//
app.get('/', function(req, res) {
  res.writeHead(200, {'Content-Type': 'text/html'});
  res.write(messengerButton.indexhtml);
  res.end();
});

// Webhook validation
// Este es el punto donde Facebook se conecta y valida las credenciales
// para establecer la conexion segura, lo hace por este endpoint
//      https://lucky-attempt.glitch.me/webhook
// mediante el metodo GET
app.get('/webhook', function(req, res) {
  if (req.query['hub.mode'] === 'subscribe' &&
      req.query['hub.verify_token'] === process.env.VERIFY_TOKEN) {
    console.log("Validating webhook");
    res.status(200).send(req.query['hub.challenge']);
  } else {
    console.error("Failed validation. Make sure the validation tokens match.");
    res.sendStatus(403);          
  }
});

// Message processing
// Una vez validada la conexion, a traves del mismo endpoint se maneja
// el envio de mensajes mediante el metodo POST
//
app.post('/webhook', function (req, res) {
  console.log(req.body);
  var data = req.body;

  // Make sure this is a page subscription
  if (data.object === 'page') {
    
    // Iterate over each entry - there may be multiple if batched
    // A veces llegan multiples entradas a la vez si el sistema 
    data.entry.forEach(function(entry) {
      var pageID = entry.id;
      var timeOfEvent = entry.time;

      // Iterate over each messaging event
      entry.messaging.forEach(function(event) {
        if (event.message) {
          RM.receivedMessage(event);
        } else if (event.postback) {
          RP.receivedPostback(event);   
        } else {
          console.log("Webhook received unknown event: ", event);
        }
      });
    });

    // Assume all went well.
    //
    // You must send back a 200, within 20 seconds, to let us know
    // you've successfully received the callback. Otherwise, the request
    // will time out and we will keep trying to resend.
    res.sendStatus(200);
  }
});


app.get('/webview', function(req, res) {
  console.log('Consulatando desde Webview');
  res.status(200).send( {'response to GET method':'Hello World!'});            
});
app.post('/webview', function(req, res) {
  console.log('Consulatando desde Webview');
  res.status(200).send( {'response to POST method':'Goodbye World!'});            
});


// Set Express to listen out for HTTP requests
var server = app.listen(process.env.PORT || 3000, function () {
  console.log("Listening on port %s", server.address().port);
});