
let fs = require('fs');
let exec = require('child_process').exec;

let authorize = require('./auth');
let credentials = require('./credentials');
let Gmail = require('./gmail');

const SCAN_LABEL_ID = 'Label_6607580414270488454';
const LOCAL_SCAN_DIRECTORY = '/Users/kevin/3D\ Scans/_UNCATEGORIZED';

module.exports = eventHandler => {
  const dispatch = (eventName, data = {}) => {
    let log = data.text || eventName;
    console.log(log + '...');
    eventHandler(eventName, data);
  };

  dispatch('authorizing')
  authorize(credentials, auth => {
    let gmail = new Gmail(auth);

    dispatch('loadingEmails');
    getActiveScanEmails(emails => {
      if (!emails || emails.length === 0) {
        return dispatch('emptyInbox', { text: 'No new 3D scans found! Goodbye :)' });
      }

      dispatch('loadedEmails', { count: emails.length, text: `Loading ${emails.length} 3D scans` });
      emails.forEach(email => {
        let subject = getSubject(email);
        getScanAttachment(email, attachment => {
          if (!attachment) {
            return dispatch('error', { text: `Error downloading attachment for: ${subject}` });
          }

          saveScanToFilesystem(email, attachment, success => {
            if (!success) {
              return dispatch('error', { text: `Error saving attachment for: ${subject}` });
            }

            archiveEmail(email, success => {
              if (!success) {
                return dispatch('error', { text: `Error archiving: ${subject}...` });
              }

              dispatch('finishedEmail', { subject, text: `Downloaded scan for: ${subject}` });
            });
          });
        });
      })
    });

    function getActiveScanEmails (callback) {
      gmail.getMessagesWithLabelIDs(['INBOX', SCAN_LABEL_ID], callback);
    }

    function getScanAttachment (email, callback) {
      gmail.getAttachments({ email, supportedMimeTypes: ['application/zip'] }, attachments => {
        let a = attachments && attachments.length > 0 ? attachments[0] : null;
        if (callback) {
          callback(a);
        }
      });
    }

    function saveScanToFilesystem (email, attachment, callback = () => {}) {
      callback(true);
      // let subject = getSubject(email);
      // let modelName = subject.replace('3D Model', '').trim().replace(/ /g, '-');
      // let zipname = `${LOCAL_SCAN_DIRECTORY}/${modelName}.zip`;
      // fs.writeFile(zipname, attachment.data, 'base64', err => {
      //   if (err) {
      //     console.log(err);
      //     callback(false);
      //     return;
      //   }
      //
      //   let dirname = zipname.replace('.zip', '');
      //   let unzipCommand = `unzip "${zipname}" -d "${dirname}"`;
      //   exec(unzipCommand, err => {
      //     if (err) {
      //       console.log(err);
      //       callback(false);
      //       return;
      //     }
      //
      //     fs.unlink(zipname, () => {
      //       callback(true);
      //     });
      //   });
      // });
    }

    function archiveEmail (email, callback) {
      callback(true);
      // gmail.archiveEmail(email.id, (err, res) => {
      //   if (callback) {
      //     callback(!err);
      //   }
      // });
    }

    function getSubject (email) {
      return email.payload.headers.find(h => h.name === 'Subject').value;
    }
  });
};
