let mqtt, request, crypto, client, token, clientID, key, iv, id, pwd, topic, payload, valid = false,
    host

crypto = require('crypto')
mqtt = require('mqtt')
request = require('sync-request')
clientID = '566592'
// key = "7f9d684d4f343c1449956fdb326a36a1"
// iv = "da646191c1b3963d9c7d7ab804b5409a"
id = "b77f0cd1c54ffd485ae11c0113b99fafb87676607d9cc79eb758768fa8878bda"
pwd = "ba2afcf008ddf67202e43544e9e89101fe97b94768383c6dfb4791e67eec4e76"
host = '172.16.100.1'
topic = 'pengujian'
let counter = 0

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
            }, 3000);
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
        console.log(token)
        console.log("Got Token");
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

let decrypt = function (cipher) {
    let encryptedText = Buffer.from(cipher, 'hex');
    let decipher = crypto.createDecipheriv('aes-128-cbc', Buffer.from(key, 'hex'), Buffer.from(iv, 'hex'));
    let decrypted = decipher.update(encryptedText);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    return decrypted.toString();
}

let encrypt = function (plain) {
    let cipher = crypto.createCipheriv('aes-128-cbc', Buffer.from(key, 'hex'), Buffer.from(iv, 'hex'));
    let encrypted = cipher.update(plain);
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    return encrypted.toString('hex')
}

if (require.main === module) {
    connect(token)
}