const SerialPort = require('serialport');
const Readline = require('@serialport/parser-readline');
const Express = require('express');
const App = Express();

const port = new SerialPort('/dev/ttyACM0', {baudRate: 9600});
const parser = port.pipe(new Readline({delimiter: '\n'}));

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
    res.send("Get request");
});