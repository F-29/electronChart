const SerialPort = require("serialport");

let toMedian = [];

const dataHeader = () => {
    return [
        25,
        50,
        75,
        100,
        125
    ];
};

const data = dataHeader();

let value = 0;


const updateValue = () => {
    value = parseInt((value / 920.5 * 135).toString());
    config.data.datasets.forEach(dataset => {
        if (toMedian.length < 5) {
            toMedian = toMedian.concat([value]);
        } else {
            dataset.data = dataHeader();
            dataset.value = median(toMedian);
            toMedian = [];
        }
    });
    window.myGauge.update();
}

median = (values) => {
    values.sort((a, b) => {
        return a - b;
    });

    let half = Math.floor(values.length / 2);

    if (values.length % 2)
        return values[half];
    else
        return (values[half - 1] + values[half]) / 2.0;
}

SerialPort.list().then((ports) => {
    let serialPort = "";
    ports.forEach(port => {
        if (port['manufacturer'] === "wch.cn") {
            serialPort = port['path'];
        }
    });
    if (serialPort.length) {
        const port = new SerialPort(serialPort, {
            baudRate: 9600,
        });
        const parser = port.pipe(new SerialPort.parsers.Readline({delimiter: '\r\n'}));
        parser.on('data', new_value => {
            value = parseInt(new_value);
            updateValue();
        });
    } else {
        //region no Device Connected Message
        document.getElementById('no-arduino-wrapper').style.marginTop = "85px";
        document.getElementById('no-arduino').innerHTML = "<span style='color: #e0e0e0'>No Device is Connected.</span>";
        document.getElementById('canvas-holder')
            .innerHTML = "<p style=\"margin-top: 15px; text-align: center; font-size: 17px; color: #bebebe\">" +
            "No Data No Chart ;D</p>" +
            "<p style=\"margin-top: 145px; text-align: center; color: #e2e2e2; font-size: 25px; margin-right: 15px;\">Connect the Device and Refresh" +
            "  <b><code style='padding: 9px; background-color: #3a617c; border-radius: 15px; color: #c5dbff'>Ctrl + R</code></b></p>";
        //endregion
    }
});

const config = {
    type: 'gauge',
    data: {
        datasets: [{
            data: data,
            value: value,
            backgroundColor: ['#00a8f1', '#4270B9', '#00b960', '#dd5d07', '#e32e2e'],
            borderWidth: 0
        }]
    },
    options: {
        responsive: true,
        title: {
            display: true,
            text: 'Plasma and Laser Technology Research Center'
        },
        layout: {
            padding: {
                top: 0,
                bottom: 60
            }
        },
        needle: {
            // Needle circle radius as the percentage of the chart area width
            radiusPercentage: 2,
            // Needle width as the percentage of the chart area width
            widthPercentage: 3.2,
            // Needle length as the percentage of the interval between inner radius (0%) and outer radius (100%) of the arc
            lengthPercentage: 80,
            // The color of the needle
            color: 'rgb(80,80,80)',
        },
        valueLabel: {
            formatter: Math.round,
        },
        plugins: {
            datalabels: {
                display: true,
                formatter: function (value, context) {
                    return '< ' + Math.round(value);
                },
                color: function (context) {
                    return context.dataset.backgroundColor;
                },
                color: 'rgb(228,228,228)',
                backgroundColor: 'rgb(55,55,55)',
                borderWidth: 8,
                borderRadius: 9,
                font: {
                    size: 18
                }
            }
        }
    }
};

window.onload = () => {
    let ctx = document.getElementById('chart').getContext('2d');
    window.myGauge = new Chart(ctx, config);
    updateValue();
    // TODO: check whether dataHeader() can be called only once(in this block)
};
