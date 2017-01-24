let { ipcRenderer, remote } = require('electron');
let moment = require('moment');

let eventLog = remote.require('./event-log.js');

(function () {
  let eventList = document.querySelector('.event-log');

  let clearButton = document.querySelector('.clear-button');
  clearButton.addEventListener('click', clearEventLog);

  let closeButton = document.querySelector('.close-button');
  closeButton.addEventListener('click', quit);

  let storedEvents = eventLog.loadStoredEvents();
  storedEvents.forEach(logEvent);

  ipcRenderer.on('notify', (event, arg) => {
    logEvent({ text: arg.options.body });
    notify(arg);
  });

  function logEvent(event) {
    let time = moment(event.date).calendar();
    let log = `${time} — ${event.text}`;

    let li = document.createElement('li');
    li.textContent = log;
    eventList.insertBefore(li, eventList.children[0]);

    eventLog.addEvent(event);
  }

  function clearEventLog() {
    eventList.innerHTML = '';

    eventLog.clearStoredEvents();
  }

  function notify({ title, options }) {
    new Notification(title, options);
  }

  function quit () {
    ipcRenderer.send('quit');
  }
})();
