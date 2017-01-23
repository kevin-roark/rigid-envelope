
let menubar = require('menubar');
let authorize = require('./auth');
let credentials = require('./credentials');
let Gmail = require('./gmail');

let mb = menubar();

mb.on('ready', () => {
  console.log('im ready (:');

  authorize(credentials, auth => {
    let gmail = new Gmail(auth);
    gmail.get3DScanMessages(emails => {

    });
  });
});
