const SerialPort = require('serialport');
const Readline = require('@serialport/parser-readline');
const Express = require('express');
const fs = require('fs');
const cors = require('cors')
const App = Express();
const port = new SerialPort('/dev/ttyACM0', {baudRate: 9600});
const parser = port.pipe(new Readline({delimiter: '\n'}));
const FILE_NAME = './data.json';

App.use(cors());

port.on('open', () => {
    console.log("Porta serial iniciada.");
});

parser.on('data', data => {
    console.log(data);

    let type = data;

    let data_obj = {};
    let rawdata = fs.readFileSync(FILE_NAME);
    let current_data = Buffer.byteLength(rawdata) ? JSON.parse(rawdata) : [];
    let date = new Date().toLocaleString('pt-br', {timeZone: 'America/Recife'}).split(' ');
    let day_str = new Date().toLocaleDateString('pt-br', {weekday: 'long'}).split(',')[0];

    data_obj.date = date[0];
    data_obj.day_str = day_str;
    data_obj.time = date[1];

    switch (data) {
        case "DIS":
            data_obj.status = "Dispensado";
            break;
        case "EMP":
            data_obj.status = "Vazio";
            break;
        case "REC":
            data_obj.status = "Recarregado";
            break;
        default:
    }

    current_data.push(data_obj);

    fs.writeFileSync(FILE_NAME, JSON.stringify(current_data, null, 2));

});


App.get('/data', function (req, res) {
    const rawdata = fs.readFileSync(FILE_NAME);
    const current_data = Buffer.byteLength(rawdata) ? JSON.parse(rawdata) : [];
    let users_amount = 0;
    let alcool_dispensed_by_date = {};
    let alcool_dispensed_by_day = {};
    let alcool_dispensed_by_hour = {};
    let recharges_by_month = {
        month_names: [
            'Janeiro',
            'Fevereiro',
            'Março',
            'Abril',
            'Maio',
            'Junho',
            'Julho',
            'Agosto',
            'Setembro',
            'Outubro',
            'Novembro',
            'Dezembro',
        ],
        recharges: [
            0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
        ]
    };
    let hour = null;

    for (let reg of current_data) {

        switch (reg.status) {
            case "Dispensado":
                users_amount++;

                hour = reg.time.split(':')[0];

                if (!alcool_dispensed_by_date[reg.date])
                    alcool_dispensed_by_date[reg.date] = [
                        0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
                    ];

                alcool_dispensed_by_date[reg.date][parseInt(hour)]++;

                if (!alcool_dispensed_by_day[reg.day_str])
                    alcool_dispensed_by_day[reg.day_str] = 0;

                alcool_dispensed_by_day[reg.day_str]++;

                if (!alcool_dispensed_by_hour[hour])
                    alcool_dispensed_by_hour[hour] = 0;

                alcool_dispensed_by_hour[hour]++;
                break;
            case "Recarregado":
                const month_number = parseInt(reg.date.split('/')[1]);

                recharges_by_month.recharges[month_number - 1]++;
        }
    }

    let dispensed_by_day = {
        labels: [],
        values: []
    };
    let dispensed_by_hour = {
        labels: [],
        values: []
    };
    let dispensed_by_day_keys = Object.keys(alcool_dispensed_by_day);
    let dispensed_by_hour_keys = Object.keys(alcool_dispensed_by_hour);

    for (let key of dispensed_by_day_keys) {
        dispensed_by_day.labels.push(key);
        dispensed_by_day.values.push(alcool_dispensed_by_day[key] / users_amount * 100);
    }

    for (let key of dispensed_by_hour_keys) {
        dispensed_by_hour.labels.push(`${key}:00`);
        dispensed_by_hour.values.push(alcool_dispensed_by_hour[key] / users_amount * 100);
    }


    res.json({
        'dispensed_by_date': Object.assign({}, alcool_dispensed_by_date),
        'dispensed_by_hour': dispensed_by_hour,
        'dispensed_by_day': dispensed_by_day,
        'recharges_by_month': recharges_by_month,
        'total_users': users_amount
    });
});

App.listen(3000);