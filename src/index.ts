import data from './data';
const template = require('art-template');
const fs = require('fs');

const webinar = template(__dirname + '/pages/Webinar/event.art.html', data);
const offline = template(__dirname + '/pages/Offline/event.art.html', data);

fs.writeFileSync('./webinar.html', webinar);
fs.writeFileSync('./offline.html', offline);
