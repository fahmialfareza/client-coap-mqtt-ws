// @ts-ignore
import coap from "coap";
import request from "sync-request";

let token =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkFkaXR5YSIsImlhdCI6MTUxNjIzOTAyMn0.4lwOlT2tyQbgSSsm_Kh8E22etlbOqItFSmmkSvKmtRw";
const id = "117f96b137b87380deb99ecc74eb3003712dca8911fb726a061cde9ee38ec6b8";
const pwd = "7b855f1173489606dc8a4d9639356238b37f44ca847ec52b509e56399b57a4eb";
const client_id = "5669243";
const host = "192.168.137.10";
const topic = "home";

let valid = true;

const now = () => Date.now(); // Utility for current timestamp

const connect = function (token: string) {
  setInterval(function () {
    if (valid) {
      const req = coap.request({
        host: host,
        port: "5683",
        pathname: `/r/${client_id}/${topic}`,
        method: "POST",
        confirmable: true,
      });

      const payload = {
        protocol: "coap",
        timestamp: now().toString(),
        topic: topic,
        token: token,
        humidity: {
          value: Math.floor(now() / 1000),
          unit: "string",
        },
        temperature: {
          value: Math.floor(now() / 1000),
          unit: "string",
        },
      };

      req.write(JSON.stringify(payload));

      req.on("response", function (res: any) {
        console.log(`Response Code: ${res.code}`);
        if (res.code === "2.01") {
          console.log(`Message Sent Successfully to topic: ${topic}`);
        } else {
          console.error(`Error Response: ${res.payload.toString()}`);
        }
      });

      req.on("error", function (err: Error) {
        console.error(`Request error: ${err.message}`);
      });

      req.end();
    } else {
      token = getToken();
    }
  }, 5000); // Set to publish every 5 seconds
};

function getToken() {
  // Implement your token refresh logic here.
  // For now, let's log a placeholder and return a dummy token.
  console.log("Fetching new token...");
  return "new-token-placeholder";
}

if (require.main === module) {
  connect(token);
}
