'use strict';

let http = require('http'),
  https = require('https'),
  Bot  = require('@kikinteractive/kik'),
  Mixpanel = require('mixpanel'),
  config = require('./config'),
  request = require('request'),
  fs = require('fs'),
  url = require('url'),
  path = require('path'),
  glitch = require('glitch'),
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

function download(picUrl, sendTo) {
  let p = url.parse(picUrl);
  let filename = path.basename(p.pathname);
  console.log("Got a photo...");
  https.get(picUrl, (res) => {
    var file = fs.createWriteStream(`original/${filename}`);
    console.log('statusCode: ', res.statusCode);
    console.log('headers: ', res.headers);
    if ( [301, 302].indexOf(res.statusCode) > -1 ) {
     download(res.headers.location, sendTo);
     return;
   }
   var data = "";
   res.on('data', (chunk) => {
     console.log("CHUNK!");
     //data += chunk;
     file.write(chunk);
    });
    res.on('end', () => {
      file.end();
      glitchFile(filename, sendTo);
    })
  });
}

function glitchFile(filename, sendTo) {
  console.log("Going to glitch?");
  glitch(`original/${filename}`, `glitched/${filename}`, 0.001, 2, 777);
  console.log("Sending ", `${config.picUrl}/glitched/${filename}`)
  bot.send(Bot.Message.picture(`${config.picUrl}/glitched/${filename}`)
    .setAttributionName('BOT HOLE BOT')
    .setAttributionIcon('https://profilepics.cf.kik.com/5AHdkTcJDFePBW0PiqE3UsQ2ezU/orig.jpg?v=1462905085217'),
    sendTo);
}

bot.onPictureMessage((message) => {
  mixpanel.track('picture-message');
  download(message.picUrl, message.from);
});

bot.onVideoMessage((message) => {
  sendGeneric(message.from);
});

function sendGeneric(sendTo) {
  mixpanel.track('generic_message');
  var myMessage = Bot.Message.text("I am a bot hole. Send me your data, and I will return it to you. I am a bot hole. This data did not make sense to me. So I swallowed it. I am a bot hole.");
  bot.send(myMessage, sendTo);
}

bot.onStickerMessage((message) => {
  sendGeneric(message.from);
});

bot.onScanDataMessage((message) => {
  sendGeneric(message.from);
});

// Set up your server and start listening
let server = http
    .createServer(bot.incoming())
    .listen(process.env.PORT || 8080);
