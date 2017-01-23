
let menubar = require('menubar');
let authorize = require('./auth');
let credentials = require('./credentials');
let gmail = require('./gmail');

let mb = menubar();

mb.on('ready', () => {
  console.log('im ready (:');

  authorize(credentials, auth => {
    gmail.listLabels(auth);
  });
});
