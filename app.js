
let menubar = require('menubar');
let authorize = require('./auth');
let credentials = require('./credentials');
let Gmail = require('./gmail');

let mb = menubar();

mb.on('ready', () => {
  console.log('im ready (:');

  authorize(credentials, auth => {
    let gmail = new Gmail(auth);
    gmail.getInbox3DScanMessages(emails => {
      emails.forEach((email, idx) => {
        gmail.getAttachments({ email, supportedMimeTypes: ['application/zip'] }, attachments => {
          console.log(`attachments for email ${email.id}:`);
          attachments.forEach(attachment => {
            console.log(`${attachment.filename} - ${attachment.mimeType}`);
          });
        });
      });
    });
  });
});
