let coap, topic, payload, req, host

coap = require('coap')
request = require('sync-request')
client_id = '12345'
host = '172.16.100.1'
topic = 'home'

const now = () => Date.now()

let connect = function () {
    let counter = 0
    let maxCounter = 100
    let interval = setInterval(function () {
        if (counter < maxCounter) {
            // if (valid) {
            payload = {
                protocol: 'coap',
                timestamp: new Date().getTime().toString(),
                topic: topic,
                //token: token,
                humidity: {
                    value: Math.floor(Math.random() * 100),
                    unit: "string"
                },
                temperature: {
                    value: Math.floor(Math.random() * 100),
                    unit: "string"
                }
            }

            pubSec = now()
            req = coap.request({
                host: host,
                port: '5683',
                pathname: '/r/' + topic,
                //pathname: '/r/' + topic,
                // query: 'token=' + token,
                method: 'post',
                confirmable: true
            });

            req.write((JSON.stringify(payload)));

            req.on('response', function (res) {
                // console.log(res.code)
                if (res.code == "2.01") {
                    counter++
                    // console.log(counter + ' Message Sent ' + topic);
                    pubSec1 = now()
                    console.log(counter + ";pubs time (sec):;" + (pubSec1 - pubSec) / 1000)
                } else if (res.code == "4.01") {
                    console.log(res.payload.toString())
                    // getToken()
                }
            })
            req.end()
            // } else {
            // let req = now()
            // token = getToken()
            // console.log(token)
            // let req1 = now()
            // console.log("\treq time (sec):\t" + (req - req1) / 1000)
            // }
        } else {
            console.log(counter + " messages successfully published")
            myStopFunction()
        }
    }, 3000)

    function myStopFunction() {
        clearInterval(interval);
    }
}

if (require.main === module) {
    connect()
}