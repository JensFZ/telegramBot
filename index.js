require('dotenv').config()

const TelegramBot = require('node-telegram-bot-api');
const fortune = require('fortune-teller');
const ping = require('ping');
const nslookup = require('nslookup');

// replace the value below with the Telegram token you receive from @BotFather
const token = process.env.KEY;

// Create a bot that uses 'polling' to fetch new updates
const bot = new TelegramBot(token, {polling: true});

bot.onText(/\/help/, (msg,match) => {
  const chatId = msg.chat.id;
  const resp = '/help - Help\n' +
               '/echo ... - Sendet ... zurueck\n' +
               '/ping ... - Pingt .... an\n' +
               '/ns domain [type] [dns] - DNS Abfrage type=a, dns=8.8.8.8' + 
               '/fortune - Fortune!';

  bot.sendMessage(chatId, resp);
});

// Matches "/echo [whatever]"
bot.onText(/\/echo (.+)/, (msg, match) => {
  // 'msg' is the received Message from Telegram
  // 'match' is the result of executing the regexp above on the text content
  // of the message

  const chatId = msg.chat.id;
  const resp = match[1]; // the captured "whatever"

  // send back the matched "whatever" to the chat
  bot.sendMessage(chatId, resp);
});

//ping
bot.onText(/\/ping (.+)/, (msg, match) => {
  const chatId = msg.chat.id;
  const ip = match[1];

  bot.sendMessage(chatId, 'pinge ' + ip);
  ping.sys.probe(ip, function(isAlive){
    msg = isAlive ? 'host ' + ip + ' is alive' : 'host ' + ip + ' is dead';
    bot.sendMessage(chatId, msg);
  });
});

bot.onText(/\/ns (.+)/, (msg, match) => {
  const chatId = msg.chat.id;
  if(match.length==2) {
    const params = (match[1]+'').split(' ');

    var type = 'a';
    var dns = '8.8.8.8';
    var target = 'google.de';

    switch(params.length) {
      case 3:
        dns = params[2];
      case 2:
        type = params[1];
      case 1:
        target = params[0];
        break;
      default:
        bot.sendMessage(chatId, 'Parameter fehlerhaft');
	return 
    }

    nslookup(target)
      .server(dns) // default is 8.8.8.8
      .type(type) // default is 'a'
      .end(function (err, addrs) {
          if(addrs.length == 0) {
            bot.sendMessage(chatId, 'unbekannt');
	  } else {
            bot.sendMessage(chatId, addrs.join('\n'));
          }
      });
  } else {
    bot.sendMessage(chatId, "Fehlender Parameter!");
  }
});

bot.onText(/\/fortune/, (msg, match) => {
 const chatId = msg.chat.id;
  const resp = match[1]; // the captured "whatever"

  bot.sendMessage(chatId, fortune.fortune());

});

// error handling
bot.on("polling_error", (err) => console.log(err));

