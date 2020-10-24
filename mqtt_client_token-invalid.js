let mqtt, request, client, token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0aGluZ3NfaWQiOiJiNzdmMGNkMWM1NGZmZDQ4NWFlMTFjMDExM2I5OWZhZmI4NzY3NjYwN2Q5Y2M3OWViNzU4NzY4ZmE4ODc4YmRhIiwidGhpbmdzX25hbWUiOiJub2RlLW1xdHQiLCJ0aW1lc3RhbXAiOiIxNTcxMjQxMTE0MjYzIiwicm9sZSI6InB1Ymxpc2hlciIsImlhdCI6MTU3MTI0MTExNCwiZXhwIjoxNTcxMjQxMTE5LCJpc3MiOiJhZGl0eWFjcHJ0bS5jb20ifQ.iz8AyRmye_xJSOpQpAKnliCfNPjYgpBNUeDBunzSHFA',
    clientID, key, iv, id, pwd, topic, payload, valid = true,
    host

mqtt = require('mqtt')
request = require('sync-request')
clientID = '5665920'
id = "b77f0cd1c54ffd485ae11c0113b99fafb87676607d9cc79eb758768fa8878bda"
pwd = "ba2afcf008ddf67202e43544e9e89101fe97b94768383c6dfb4791e67eec4e76"
host = '172.16.100.1'
topic = 'home'

let connect = function (token) {
    if (valid) {
        client = mqtt.connect('mqtt://' + host, {
            port: 1883,
            username: token,
            password: '',
            clientId: clientID
        })

        client.on('connect', function () {
            console.log('Connected')
            // setInterval(function () {
                // topic = clientID + '/' + topic
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
                console.log('Message Sent ' + topic);
                client.end()
            // }, 3000);
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
    } else {
        token = getToken()
        connect(token)
    }
}

let getToken = function () {
    var response = request('POST', 'http://' + host + '/things/request', {
        json: {
            "things_id": id,
            "things_password": pwd
        },
    });
    if (response.statusCode == 200 && response.body) {
        //token = decrypt(response.body.toString())
        token = JSON.parse(response.body).token
        console.log("Got Token");
        console.log(token)
        valid = true
        return token
    } else if (response.statusCode == 401) {
        data = response.body.toString()
        console.log(data)
        console.log("Wait 10 seconds");
        setTimeout(function () {
            getToken();
        }, 10000)
    }
}

if (require.main === module) {
    connect(token)
}