$(document).ready(async function () {
    let line_graph_inst = null;
    let pie_graph_1_inst = null;
    let pie_graph_2_inst = null;
    let recharges_graph_inst = null;
    let current_date = new Date().toLocaleString('pt-br', {timeZone: 'America/Recife'}).split(' ')[0];

    try {
        let data_response = await getData();

        $('#totalUsers').text(data_response.total_users);

        let select_options_keys = Object.keys(data_response.dispensed_by_date);

        for (let key of select_options_keys) {
            $('select').append(`<option value="${key}">${key}</option>`);

            if (current_date === key)
                $('select').val(key);
        }

        $('select').formSelect();

        line_graph_inst = setFirstGraph(line_graph_inst, data_response.dispensed_by_date[current_date]);
        pie_graph_1_inst = setSecGraph(pie_graph_1_inst, data_response.dispensed_by_day);
        pie_graph_2_inst = setThirdGraph(pie_graph_2_inst, data_response.dispensed_by_hour);
        recharges_graph_inst = setRechargesByMonthGraph(recharges_graph_inst, data_response.recharges_by_month);
    } catch (error) {
        alert(error);
    }
});

function getData() {
    return $.get('http://localhost:3000/data');
}

function tooltipCustom(items) {
    let number_str = items[0].parsed.toFixed(2);

    return `${number_str}%`;
}

function setFirstGraph(instance, data) {
    let ctx = document.getElementById('myChart1').getContext('2d');

    if (instance) {
        return;
    }

    return new Chart(ctx, {
        type: 'line',
        data: {
            labels: [
                '00:00', '01:00', '02:00', '03:00', '04:00', '05:00', '06:00', '07:00', '08:00', '09:00', '10:00',
                '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00',
                '22:00', '23:00'
            ],
            datasets: [{
                label: 'Álcool dispensado',
                data: data,
                backgroundColor:['black'],
                borderColor: '#62CA76',
                borderWidth: 1
            }]
        },
        options: {
            plugins: {
                title: {
                    display: true,
                    text: 'Fluxo de álcool dispensado por período na data selecionada',
                }
            },
            scales: {
                y: {
                    ticks: {
                        numSteps: 1,
                        beginAtZero: true
                    },
                }
            }
        }
    });
}

function setSecGraph(instance, data) {
    let ctx = document.getElementById('myChart2').getContext('2d');

    if (instance) {
        return;
    }

    return new Chart(ctx, {
        type: 'pie',
        data: {
            labels: data.labels,
            datasets: [{
                data: data.values,
                backgroundColor: [
                    '#62CA76',
                    '#413FC6',
                    '#E45851',
                    '#FDDE69',
                    'rgba(255, 99, 132, 0.2)',
                    'rgba(54, 162, 235, 0.2)',
                    'rgba(255, 206, 86, 0.2)',
                    'rgba(75, 192, 192, 0.2)',
                    'rgba(153, 102, 255, 0.2)',
                    'rgba(255, 159, 64, 0.2)'
                ],
                borderColor: [
                    '#62CA76',
                    '#413FC6',
                    '#E45851',
                    '#FDDE69',
                    'rgba(255, 99, 132, 0.2)',
                    'rgba(54, 162, 235, 0.2)',
                    'rgba(255, 206, 86, 0.2)',
                    'rgba(75, 192, 192, 0.2)',
                    'rgba(153, 102, 255, 0.2)',
                    'rgba(255, 159, 64, 0.2)'
                ],
                borderWidth: 1
            }]
        },
        options: {
            plugins: {
                tooltip: {
                    callbacks: {
                        footer: tooltipCustom,
                    }
                },
                title: {
                    display: true,
                    text: 'Fluxo de álcool dispensado por dia',
                }
            },
        }
    });
}

function setThirdGraph(instance, data) {
    let ctx = document.getElementById('myChart3').getContext('2d');

    if (instance) {
        return;
    }

    return new Chart(ctx, {
        type: 'pie',
        data: {
            labels: data.labels,
            datasets: [{
                data: data.values,
                backgroundColor: [
                    '#62CA76',
                    '#413FC6',
                    '#E45851',
                    '#FDDE69',
                    'rgba(255, 99, 132, 0.2)',
                    'rgba(54, 162, 235, 0.2)',
                    'rgba(255, 206, 86, 0.2)',
                    'rgba(75, 192, 192, 0.2)',
                    'rgba(153, 102, 255, 0.2)',
                    'rgba(255, 159, 64, 0.2)'
                ],
                borderColor: [
                    '#62CA76',
                    '#413FC6',
                    '#E45851',
                    '#FDDE69',
                    'rgba(255, 99, 132, 0.2)',
                    'rgba(54, 162, 235, 0.2)',
                    'rgba(255, 206, 86, 0.2)',
                    'rgba(75, 192, 192, 0.2)',
                    'rgba(153, 102, 255, 0.2)',
                    'rgba(255, 159, 64, 0.2)'
                ],
                borderWidth: 1
            }]
        },
        options: {
            plugins: {
                tooltip: {
                    callbacks: {
                        footer: tooltipCustom,
                    }
                },
                title: {
                    display: true,
                    text: 'Fluxo de álcool dispensado por hora',
                }
            },
        }
    });
}

function setRechargesByMonthGraph(instance, data) {
    let ctx = document.getElementById('recharges-by-month').getContext('2d');

    if (instance) {
        return;
    }

    return new Chart(ctx, {
        type: 'line',
        data: {
            labels: data.month_names,
            datasets: [{
                label: 'Quantidade de recargas',
                data: data.recharges,
                backgroundColor:['black'],
                borderColor: '#62CA76',
                borderWidth: 1
            }]
        },
        options: {
            plugins: {
                title: {
                    display: true,
                    text: 'Fluxo de recargas por mês',
                }
            },
            scales: {
                y: {
                    ticks: {
                        numSteps: 1,
                        beginAtZero: true
                    },
                }
            }
        }
    });
}