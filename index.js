'use strict';

let util = require('util'),
  http = require('http'),
  Bot  = require('@kikinteractive/kik'),
  Mixpanel = require('mixpanel'),
  config = require('./config'),
  request = require('request'),
  fs = require('fs'),
  glitch = require('glitch').GlitchedStream,
  zalgo = require('to-zalgo'),
  banish = require('to-zalgo/banish');

var mixpanel = Mixpanel.init(config.mixPanelAPI);

// Configure the bot API endpoint, details for your bot

let bot = new Bot({
  username: config.username,
  apiKey: config.apiKey,
  baseUrl: config.baseUrl
});

bot.updateBotConfiguration();

var gstream = new glitch({
  'deviation' : 1,
  'probabibility' : 1
});

bot.onStartChattingMessage((message) => {
  mixpanel.track('start-chatting');
  message.reply(`I am a bot hole. Send me your data, and I will return it to you. I am a bot hole.`);
});

bot.onTextMessage((message) => {
  mixpanel.track('text_message');
  var myMessage = Bot.Message
  var evil = zalgo(message.body, {size: 'maxi'});
  bot.send(evil, message.from);
  banish(evil);
  console.log(evil);
});

bot.onLinkMessage((message) => {
  sendGeneric(message.from);
});

bot.onPictureMessage((message) => {
  sendGeneric(message.from);
});

bot.onVideoMessage((message) => {
  sendGeneric(message.from);
});

function sendGeneric(sendTo) {
  mixpanel.track('generic_message');
  var myMessage = Bot.Message.text("I am a bot hole. Send me your data, and I will return it to you. I am a bot hole. This data did not make sense to me. So I swallowed it. I am a bot hole.");
  bot.send(myMessage, sendTo);
}

// Set up your server and start listening
let server = http
    .createServer(bot.incoming())
    .listen(process.env.PORT || 8080);
