let coap, token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkFkaXR5YSIsImlhdCI6MTUxNjIzOTAyMn0.4lwOlT2tyQbgSSsm_Kh8E22etlbOqItFSmmkSvKmtRw', topic, payload, req, id, pwd, valid = true, host

coap = require('coap')
request = require('sync-request')
id = '117f96b137b87380deb99ecc74eb3003712dca8911fb726a061cde9ee38ec6b8'
pwd = '7b855f1173489606dc8a4d9639356238b37f44ca847ec52b509e56399b57a4eb'
client_id = '5669243'
host = '192.168.137.10'
topic = 'home'

let connect = function (token) {
    setInterval(function () {
        if (valid) {
            req = coap.request({
                host: host,
                port: '5683',
                pathname: '/r/' + client_id + '/' + topic,
                //pathname: '/r/' + topic,
                //query: 'token=' + token,
                method: 'post',
                confirmable: true
            });

            payload = {
                protocol: 'coap',
                timestamp: new Date().getTime().toString(),
                topic: topic,
                token: token,
                humidity: {
                    value: Math.floor(Date.now() / 1000),
                    unit: "string"
                },
                temperature: {
                    value: Math.floor(Date.now() / 1000),
                    unit: "string"
                }
            }
            req.write((JSON.stringify(payload)));

            req.on('response', function (res) {
                console.log(res.code)
                if (res.code == "2.01") {
                    console.log('Message Sent ' + topic);
                } else if (res.code == "4.00") {
                    console.log(res.payload.toString())
                } else {
                    console.log(res.payload.toString())
                }
            })
            req.end()
        } else {
            token = getToken()
        }
    }, 5000)
}

if (require.main === module) {
    connect(token)
}