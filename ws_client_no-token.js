let socket, request, id, iv, pwd, token, topic, io, client_id, valid = true,
    host

io = require('socket.io-client')
client_id = '12345'
host = '172.16.100.1'
topic = 'home'

const now = () => Date.now()

let connect = function () {
    let counter = 1
    let maxCounter = 2
    let interval = setInterval(function () {
        if (counter <= maxCounter) {
            conSec = now()
            socket = io.connect('http://' + host + ':' + 3000, {
                reconnect: true,
                // query: {
                //     token: token
                // }
            });

            socket.on('connect', () => {
                // let topics = ['12345/pengujian-coap' , '54321/pengujian-mqtt']
                let topic = 'home'
                // topics.forEach(function (topic) {
                // socket.on('/r/' + topic, (data) => {
                //     // console.log(data)
                // })
                socket.emit('subscribe', topic);
                
                conSec1 = now()
                console.log(counter + ";conn time (sec):;" + (conSec1 - conSec) / 1000)
                socket.disconnect()
                counter++
                // })
            });

            socket.on('error_msg', (reason) => {
                console.log(reason);
            })

            socket.on('/r/' + topic, (data) => {
                // console.log(data)
            })

            socket.on('disconnect', (reason) => {
                if (reason === 'io server disconnect') {
                    // the disconnection was initiated by the server, you need to reconnect manually
                    socket.connect();
                }
                // else the socket will automatically try to reconnect
            });
        } else {
            // console.log(counter + " messages successfully published")
            myStopFunction()
        }
    }, 2000)

    function myStopFunction() {
        clearInterval(interval);
    }
}

if (require.main === module) {
    connect()
}