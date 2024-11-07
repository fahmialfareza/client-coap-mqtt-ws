// @ts-ignore
import mqtt from "mqtt";
import request from "sync-request";

const clientID = "5665920";
const id = "b77f0cd1c54ffd485ae11c0113b99fafb87676607d9cc79eb758768fa8878bda";
const pwd = "ba2afcf008ddf67202e43544e9e89101fe97b94768383c6dfb4791e67eec4e76";
const host = "172.16.100.1";
const topic = "home";
let client: any;
let valid = true;

// Initial token
let token = "your-initial-token";

const publishMessage = () => {
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

  client.publish(topic, JSON.stringify(payload), { qos: 1 }, (err: Error) => {
    if (err) {
      console.error("Publish failed:", err.message);
    } else {
      console.log("Message sent to topic:", topic);
    }
  });
};

const connectClient = (token: string) => {
  client = mqtt.connect(`mqtt://${host}`, {
    port: 1883,
    username: token,
    password: "",
    clientId: clientID,
  });

  client.on("connect", () => {
    console.log("Connected to MQTT broker");
    publishMessage();
  });

  client.on("close", () => {
    console.log("Connection closed");
  });

  client.on("error", (error: Error) => {
    console.error("Connection error:", error.message);
    client.end(true);
  });

  client.on("message", (topic: string, message: string) => {
    console.log(`Received message from ${topic}: ${message.toString()}`);
  });
};

const getToken = () => {
  try {
    const response: any = request("POST", `http://${host}/things/request`, {
      json: { things_id: id, things_password: pwd },
    });

    if (response.statusCode === 200) {
      const responseBody = JSON.parse(response.body);
      token = responseBody.token;
      valid = true;
      console.log("Token acquired:", token);
      connectClient(token);
    } else {
      console.error("Token request failed:", response.body.toString());
      setTimeout(getToken, 10000); // Retry after 10 seconds
    }
  } catch (error: any) {
    console.error("Error requesting token:", error.message);
    setTimeout(getToken, 10000); // Retry after 10 seconds
  }
};

// Start the process
if (require.main === module) {
  if (!token) {
    getToken();
  } else {
    connectClient(token);
  }
}
