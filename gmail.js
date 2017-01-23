
const google = require('googleapis');
const scanLabelId = 'Label_6607580414270488454';

module.exports = class Gmail {
  constructor (auth) {
    this.auth = auth;
    this.gmail = google.gmail('v1');;
  }

  apiParams (params = {}) {
    let defaultParams = { auth: this.auth, userId: 'me' };
    return Object.assign(defaultParams, params);
  }

  listLabels () {
    this.gmail.users.labels.list(this.apiParams(), (err, response) => {
      if (err) {
        console.log('The API returned an error: ' + err);
        return;
      }

      let labels = response.labels;
      if (labels.length === 0) {
        console.log('No labels found.');
      } else {
        console.log('Labels:');
        labels.forEach(label => {
          console.log('(id, name) - (%s, %s)', label.id, label.name);
        });
      }
    });
  }

  getInboxMessages (callback) {
    this.gmail.users.messages.list(this.apiParams({ labelIds: 'INBOX' }), (err, response) => {
      if (err) {
        console.log('The API returned an error: ' + err);
        return;
      }

      let { messages } = response;
      let remaining = messages.length;
      let emails = [];
      messages.forEach(message => {
        this.gmail.users.messages.get(this.apiParams({ id: message.id }), (err, response) => {
          if (response) {
            emails.push(response);
          }

          remaining -= 1;
          if (remaining === 0) {
            finish(emails);
          }
        })
      });

      function finish (emails) {
        if (callback) {
          callback(emails);
        }
      }
    });
  }

  get3DScanMessages (callback) {
    this.getInboxMessages(emails => {
      let scanEmails = emails.filter(email => {
        return email.labelIds.indexOf(scanLabelId) >= 0;
      });

      console.log(scanEmails);
      if (callback) {
        callback(scanEmails);
      }
    });
  }
}

module.exports.getInboxMessages = (auth, callback) => {

};
