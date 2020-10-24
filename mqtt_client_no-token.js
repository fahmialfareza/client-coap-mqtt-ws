let mqtt, client, token, clientID, topic, payload, host

mqtt = require('mqtt');
clientID = '54321';
host = '172.16.100.1';
topic = 'home';
let counter = 0;

let connect = function () {
    client = mqtt.connect('mqtt://' + host, {
        port: 1883,
        clientId: clientID
    })

    client.on('connect', function () {
        console.log('Connected')
        setInterval(function () {
            payload = {
                protocol: client.options.protocol,
                timestamp: new Date().getTime().toString(),
                topic: clientID + '/' + topic,
                humidity: {
                    value: Math.floor(Math.random() * 100),
                    unit: "string"
                },
                temperature: {
                    value: Math.floor(Math.random() * 100),
                    unit: "string"
                }
            }
            client.publish(topic, JSON.stringify(payload), {
                qos: 1
            });
            counter++
            console.log(counter + ' Message Sent ' + topic);
        }, 500);
    })

    client.on('close', (error) => {
        if (error) console.log(error.toString())
        client.end(true)
    });

    client.on('error', (error) => {
        if (error) console.log(error.toString())
        client.end(true)
    })

    client.on('message', function (topic, message) {
        console.log(message.toString())
        client.end()
    })
}

if (require.main === module) {
    connect(token)
}