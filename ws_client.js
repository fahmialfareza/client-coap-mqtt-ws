let socket, request, token = null,
    topic, io, client_id, host

io = require('socket.io-client')
request = require('sync-request')
things_id = '8e719ef942ef52356f7d0d2c3159a497447bb9300697692bf82cc1d7ddb6c646'
things_password = 'd72f79104cf77e77f9b96a86adbfe4636fe382fb9608ea03a8a154c5b190ea07'
// client_id = '12345'
host = '172.16.100.1'
// topic = 'pengujian'

const now = () => Date.now()

let connect = function (token) {
    // let counter = 1
    // let maxCounter = 5
    // let interval = setInterval(function () {
        // if (counter <= maxCounter) {
            // conSec = now()
            socket = io.connect('http://' + host + ':' + 3000, {
                reconnect: true,
                query: {
                    token: token
                }
            });

            socket.on('connect', () => {
                // let topics = ['12345/pengujian-coap' , '54321/pengujian-mqtt']
                // let topic = 'ee6967a5/home/garage'
                let topic = '5484e3b2/home/kitchen'
                // topics.forEach(function (topic) {
                socket.on('/r/' + topic, (data) => {
                    console.log(data)
                })
                socket.emit('subscribe', topic);

                // conSec1 = now()
                // console.log(counter + ";conn time (sec):;" + (conSec1 - conSec) / 1000)
                // socket.disconnect()
                // counter++
                // })
            });

            socket.on('error_msg', (reason) => {
                console.log(reason);
            })

            // socket.on('/r/' + topic, (data) => {
            //     console.log(data)
            // })

            socket.on('disconnect', (reason) => {
                if (reason === 'io server disconnect') {
                    // the disconnection was initiated by the server, you need to reconnect manually
                    socket.connect();
                }
                // else the socket will automatically try to reconnect
            });
        // } else {
        //     myStopFunction()
        // }
    // }, 2000)

    function myStopFunction() {
        clearInterval(interval);
    }
}

let getToken = function () {
    // let req = now()
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
        // let req1 = now()
        // console.log("#;req time (sec):;" + (req1 - req) / 1000)
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