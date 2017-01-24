
const google = require('googleapis');

module.exports = class Gmail {
  constructor(auth) {
    this.auth = auth;
    this.gmail = google.gmail('v1');
  }

  apiParams(params = {}) {
    let defaultParams = { auth: this.auth, userId: 'me' };
    return Object.assign(defaultParams, params);
  }

  listLabels() {
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

  getMessagesWithLabelIDs(labelIds, callback) {
    this.gmail.users.messages.list(this.apiParams({ labelIds }), (err, response) => {
      if (err) {
        console.log('The API returned an error: ' + err);
        if (callback) {
          callback(null);
        }
        return;
      }

      let { messages } = response;
      let remaining = messages.length;
      let emails = [];
      messages.forEach(message => {
        this.gmail.users.messages.get(this.apiParams({ id: message.id }), (err, email) => {
          if (!err && email) {
            emails.push(email);
          }

          remaining -= 1;
          if (remaining === 0) {
            finish(emails);
          }
        });
      });

      function finish(emails) {
        if (callback) {
          callback(emails);
        }
      }
    });
  }

  getInboxMessages(callback) {
    this.getMessagesWithLabelIDs('INBOX', callback);
  }

  getAttachments({ email, supportedMimeTypes }, callback) {
    let attachmentParts = email.payload.parts.filter(part => {
      if (!(part.filename && part.filename.length > 0)) {
        return false;
      }

      if (supportedMimeTypes && supportedMimeTypes.indexOf(part.mimeType) < 0) {
        return false;
      }

      return true;
    });

    let remaining = attachmentParts.length;
    let attachments = [];
    attachmentParts.forEach(part => {
      let params = this.apiParams({
        id: part.body.attachmentId,
        messageId: email.id
      });
      this.gmail.users.messages.attachments.get(params, (err, attachment) => {
        if (!err && attachment) {
          attachments.push({
            filename: part.filename,
            mimeType: part.mimeType,
            size: attachment.size,
            data: attachment.data
          });
        }

        remaining -= 1;
        if (remaining === 0) {
          finish(attachments);
        }
      });
    });

    function finish(attachments) {
      if (callback) {
        callback(attachments);
      }
    }
  }

  addLabels({ messageId, labelIds }, callback) {
    let params = this.apiParams({
      id: messageId,
      addLabelIds: labelIds
    });
    this.gmail.users.messages.modify(params, (err, response) => {
      if (err) {
        console.log('The API returned an error: ' + err);
        if (callback) {
          callback(err, null);
        }
        return;
      }

      if (callback) {
        callback(null, response);
      }
    });
  }

  removeLabels({ messageId, labelIds }, callback) {
    let params = this.apiParams({
      id: messageId,
      removeLabelIds: labelIds
    });
    this.gmail.users.messages.modify(params, (err, response) => {
      if (err) {
        console.log('The API returned an error: ' + err);
        if (callback) {
          callback(err, null);
        }
        return;
      }

      if (callback) {
        callback(null, response);
      }
    });
  }

  archiveEmail(messageId, callback) {
    this.removeLabels({ messageId, labelIds: ['INBOX'] }, callback);
  }
};
