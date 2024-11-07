import crypto from "crypto";
// @ts-ignore
import mqtt from "mqtt";
import request from "sync-request";

const clientID = "566592";
const id = "b77f0cd1c54ffd485ae11c0113b99fafb87676607d9cc79eb758768fa8878bda";
const pwd = "ba2afcf008ddf67202e43544e9e89101fe97b94768383c6dfb4791e67eec4e76";
const host = "172.16.100.1";
const topic = "pengujian";
let counter = 0;
let token = null;
let valid = false;

// Encryption and decryption keys (Uncomment and set these if required for your token handling)
const key = "7f9d684d4f343c1449956fdb326a36a1";
const iv = "da646191c1b3963d9c7d7ab804b5409a";

const connectToMQTT = (token: string) => {
  if (!valid) {
    token = getToken();
    connectToMQTT(token);
    return;
  }

  const client = mqtt.connect(`mqtt://${host}`, {
    port: 1883,
    username: token,
    password: "",
    clientId: clientID,
  });

  client.on("connect", () => {
    console.log("Connected to MQTT broker");
    setInterval(() => {
      const payload = {
        protocol: client.options.protocol,
        timestamp: Date.now().toString(),
        topic: `${clientID}/${topic}`,
        humidity: {
          value: Math.floor(Math.random() * 100),
          unit: "string",
        },
        temperature: {
          value: Math.floor(Math.random() * 100),
          unit: "string",
        },
      };
      client.publish(topic, JSON.stringify(payload), { qos: 1 });
      counter++;
      console.log(`${counter} Message Sent to topic: ${topic}`);
    }, 3000);
  });

  client.on("close", (error: Error) => {
    if (error) console.error("Connection closed:", error.message);
    client.end(true);
  });

  client.on("error", (error: Error) => {
    console.error("Connection error:", error.message);
    client.end(true);
  });

  client.on("message", (topic: string, message: string) => {
    console.log(`Received message from ${topic}: ${message.toString()}`);
    client.end();
  });
};

const getToken = () => {
  try {
    const response: any = request("POST", `http://${host}/things/request`, {
      json: {
        things_id: id,
        things_password: pwd,
      },
    });

    if (response.statusCode === 200 && response.body) {
      const responseBody = JSON.parse(response.body);
      token = responseBody.token;
      console.log("Token acquired:", token);
      valid = true;
      return token;
    } else if (response.statusCode === 401) {
      console.log("Unauthorized. Retrying in 10 seconds...");
      setTimeout(getToken, 10000);
    }
  } catch (error: any) {
    console.error("Failed to get token:", error.message);
    setTimeout(getToken, 10000);
  }
};

const decrypt = (cipher: string) => {
  const encryptedText = Buffer.from(cipher, "hex");
  const decipher = crypto.createDecipheriv(
    "aes-128-cbc",
    Buffer.from(key, "hex"),
    Buffer.from(iv, "hex")
  );
  let decrypted = decipher.update(encryptedText);
  decrypted = Buffer.concat([decrypted, decipher.final()]);
  return decrypted.toString();
};

const encrypt = (plain: string) => {
  const cipher = crypto.createCipheriv(
    "aes-128-cbc",
    Buffer.from(key, "hex"),
    Buffer.from(iv, "hex")
  );
  let encrypted = cipher.update(plain);
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  return encrypted.toString("hex");
};

// Start process
if (require.main === module) {
  if (!token) {
    getToken();
  } else {
    connectToMQTT(token);
  }
}
