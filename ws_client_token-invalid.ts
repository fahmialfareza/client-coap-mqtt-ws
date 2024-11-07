import crypto from "crypto";
// @ts-ignore
import io from "socket.io-client";
import request from "sync-request";

const deviceID =
  "8e719ef942ef52356f7d0d2c3159a497447bb9300697692bf82cc1d7ddb6c646";
const devicePassword =
  "d72f79104cf77e77f9b96a86adbfe4636fe382fb9608ea03a8a154c5b190ea07";
const clientID = "ws_74145d49";
const host = "172.16.100.1";
const port = 3000;
let token = null;
let socket: any = null;

// Topics to subscribe to
const topics = ["5669243/home", "5665920/home"];

// Connect to WebSocket server with a token
const connect = (token: string) => {
  socket = io(`http://${host}:${port}`, {
    reconnect: true,
    query: { token },
  });

  socket.on("connect", () => {
    console.log("Connected to server");
    topics.forEach((topic) => {
      console.log(`Subscribing to topic: ${topic}`);
      socket.emit("subscribe", topic);
      socket.on(`/r/${topic}`, (data: any) => {
        console.log("Received data:", data);
      });
    });
  });

  socket.on("error_msg", (reason: string) => {
    console.error("Error message:", reason);
  });

  socket.on("disconnect", (reason: string) => {
    console.log("Disconnected:", reason);
  });
};

// Retrieve a new token from the server
const getToken = () => {
  const response: any = request("POST", `http://${host}/device/request`, {
    json: {
      device_id: deviceID,
      device_password: devicePassword,
    },
  });

  if (response.statusCode === 200 && response.body) {
    const responseBody = JSON.parse(response.body);
    token = responseBody.token;
    console.log("Token retrieved successfully");
    return token;
  } else if (response.statusCode === 401) {
    console.error("Unauthorized - Waiting 10 seconds to retry");
    setTimeout(getToken, 10000);
  } else {
    console.error("Error retrieving token:", response.body.toString());
    setTimeout(getToken, 10000);
  }
};

// Main execution
if (require.main === module) {
  if (!token) {
    token = getToken();
  }
  connect(token);
}
