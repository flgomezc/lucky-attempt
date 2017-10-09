'use strict'
const send = require('./../handlers/send.js')

// Incoming events handling
function receivedMessage(event) {
  var senderID = event.sender.id;
  var recipientID = event.recipient.id;
  var timeOfMessage = event.timestamp;
  var message = event.message;

  console.log("Received message for user %d and page %d at %d with message:", 
    senderID, recipientID, timeOfMessage);
  console.log(JSON.stringify(message));

  var messageId = message.mid;
  var messageText = message.text;
  var messageAttachments = message.attachments;

  if (messageText) {
    // If we receive a text message, check to see if it matches a keyword
    // and send back the template example. Otherwise, just echo the text we received.
    switch (messageText) {
      case 'generic':
        send.GenericMessage(senderID);
        break;

      default:
        send.TextMessage(senderID, messageText);
    }
  } else if (messageAttachments) {
    send.TextMessage(senderID, "Message with attachment received");
  }
}

module.exports.receivedMessage = (event) => receivedMessage(event)