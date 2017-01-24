
let electron = require('electron');
let { ipcMain } = electron;
let menubar = require('menubar');
let email3DScanCollector = require('./email-3dscan-collector');

const SCAN_CHECK_INTERVAL = 1000 * 60 * 30; // 30 minutes

let mb = menubar();
let canNotify = false;

mb.on('ready', () => {
  handle3DScanEmails();
  setInterval(handle3DScanEmails, SCAN_CHECK_INTERVAL);
});

let notificationQueue = [];
mb.on('after-create-window', () => {
  canNotify = true;
  if (notificationQueue.length > 0) {
    notificationQueue.forEach(({ title, options }) => makeNotification(title, options));
    notificationQueue = [];
  }
});

function handle3DScanEmails () {
  email3DScanCollector((eventName, data) => {
    switch (eventName) {
      case 'error': {

      } break;

      case 'loadedEmails': {
        makeNotification('Downloading 3D scans', { body: data.text });
      } break;

      case 'finishedEmail': {

      } break;

      default: break;
    }
  });
}

function makeNotification(title, options = {}) {
  if (!canNotify) {
    notificationQueue.push({ title, options });
    return;
  }

  // TODO: this needs to run in the renderer process
  // options.icon = path.join(__dirname, 'icon.png') would be cool
  // new Notification(title, options);
}
