let coap, request, token = null,
    topic, payload, req,
    host

coap = require('coap')
request = require('sync-request')
things_id = 'a82fc1123492ce4259fc77e3133d2ca4d45236fc8a0cd5aabdf87454f516b1d9'
things_password = '63a783d373538cf0d2ecb926e6be550cb4204357322214ebb5a4a52c49acf747'
client_id = '12345'
host = '172.16.100.1'
topic = 'home'

const now = () => Date.now()

let connect = function (token) {
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
                    query: 'token=' + token,
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
                    } else if (res.code == "4.00") {
                        console.log(res.payload.toString())
                        getToken()
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

let getToken = function () {
    let req = now()
    var response = request('POST', 'http://' + host + '/things/request', {
        json: {
            "things_id": things_id,
            "things_password": things_password
        },
    });
    if (response.statusCode == 200 && response.body) {
        //token = decrypt(response.body.toString())
        token = JSON.parse(response.body).token
        // console.log("Got Token");
        // valid = true
        // return token
        let req1 = now()
        console.log("#;req time (sec):;" + (req1 - req) / 1000)
        connect(token)
    } else if (response.statusCode == 401) {
        data = response.body.toString()
        console.log(data + ' - Wait 10 seconds')
        // setTimeout(function () {
            getToken();
        // }, 10000)
    } else {
        data = response.body.toString()
        console.log(data + ' - Wait 10 seconds')
        // setTimeout(function () {
            getToken();
        // }, 10000)
    }
}

if (require.main === module) {
    if (token == null) {
        getToken()
    } else {
        connect(token)
    }
}