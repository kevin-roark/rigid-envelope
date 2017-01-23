
let menubar = require('menubar');
let Gmail = require('node-gmail-api');
let credentials = require('./credentials');

let gmail = new Gmail(credentials.clientID);
let mb = menubar();

mb.on('ready', () => {
  console.log('im ready (:');
  let messages = gmail.messages('label:inbox', { max: 50 });
  messages.on('data', message => {
    console.log(message);
  });
});
