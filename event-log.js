
let path = require('path');
let fs = require('fs');

let filename = path.join(__dirname, 'event-log.json');

let storedEvents = module.exports.loadStoredEvents = () => {
  let data = fs.readFileSync(filename);
  return JSON.parse(data) || [];
};

module.exports.addEvent = event => {
  if (!event.date) event.date = new Date();

  let events = storedEvents();
  events.push(event);

  fs.writeFileSync(filename, JSON.stringify(events));
};

module.exports.clearStoredEvents = () => {
  fs.writeFileSync(filename, '[]');
};
