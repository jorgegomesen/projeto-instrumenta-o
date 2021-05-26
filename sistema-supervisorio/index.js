const SerialPort = require('serialport');
const Readline = require('@serialport/parser-readline');
const Express = require('express');
const cors = require('cors')
const App = Express();

const port = new SerialPort('/dev/ttyACM0', {baudRate: 9600});
const parser = port.pipe(new Readline({delimiter: '\n'}));

App.use(cors());

let users_amount = 0;
let alcool_dispensed_by_date = {};
let alcool_dispensed_by_day = {};
let alcool_dispensed_by_hour = {};

port.on('open', () => {
    console.log("Porta serial iniciada.");
});

parser.on('data', data => {
    let date = new Date().toLocaleString('pt-br', {timeZone: 'America/Recife'}).split(' ');
    let day_str = new Date().toLocaleDateString('pt-br', {weekday: 'long'}).split(',')[0];
    let date_str = date[0];
    let time_str = date[1];
    let hour = time_str.split(':')[0];

    users_amount++;

    if (!alcool_dispensed_by_date[date_str])
        alcool_dispensed_by_date[date_str] = [
            0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
        ];

    alcool_dispensed_by_date[date_str][parseInt(hour)]++;

    if (!alcool_dispensed_by_day[day_str])
        alcool_dispensed_by_day[day_str] = 0;

    alcool_dispensed_by_day[day_str]++;

    if (!alcool_dispensed_by_hour[hour])
        alcool_dispensed_by_hour[hour] = 0;

    alcool_dispensed_by_hour[hour]++;
});


App.get('/data', function (req, res) {
    let dispensed_by_day = {
        keys: [],
        values: []
    };
    let dispensed_by_hour = {
        keys: [],
        values: []
    };
    let dispensed_by_day_keys = Object.keys(alcool_dispensed_by_day);
    let dispensed_by_hour_keys = Object.keys(alcool_dispensed_by_hour);

    for (let key of dispensed_by_day_keys) {
        dispensed_by_day.keys.push(key);
        dispensed_by_day.values.push(alcool_dispensed_by_day[key] / users_amount);
    }

    for (let key of dispensed_by_hour_keys) {
        dispensed_by_hour.keys.push(key);
        dispensed_by_hour.values.push(alcool_dispensed_by_hour[key] / users_amount);
    }


    res.json({
        'dispensed_by_date': Object.assign({}, alcool_dispensed_by_date),
        'dispensed_by_hour': dispensed_by_hour,
        'dispensed_by_day': dispensed_by_day
    });
});

App.listen(3000);