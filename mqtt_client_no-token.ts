// @ts-ignore
import mqtt from "mqtt";

const clientID = "54321";
const host = "172.16.100.1";
const topic = "home";
const maxMessages = 100; // Stop after 100 messages
let counter = 0;
let client: any;

const connect = () => {
  client = mqtt.connect(`mqtt://${host}`, {
    port: 1883,
    clientId: clientID,
  });

  client.on("connect", () => {
    console.log("Connected to MQTT broker");

    const interval = setInterval(() => {
      if (counter >= maxMessages) {
        console.log(`${counter} messages successfully published`);
        clearInterval(interval);
        client.end();
        return;
      }

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

      client.publish(
        topic,
        JSON.stringify(payload),
        { qos: 1 },
        (err: Error) => {
          if (err) {
            console.error(`Failed to publish message: ${err.message}`);
          } else {
            counter++;
            console.log(`${counter} Message Sent to topic ${topic}`);
          }
        }
      );
    }, 500);
  });

  client.on("close", () => {
    console.log("Connection closed");
  });

  client.on("error", (error: Error) => {
    console.error(`Connection error: ${error.message}`);
    client.end();
  });

  client.on("message", (topic: string, message: string) => {
    console.log(`Received message from ${topic}: ${message.toString()}`);
  });
};

if (require.main === module) {
  connect();
}
