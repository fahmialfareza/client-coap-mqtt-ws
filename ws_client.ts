const io = require("socket.io-client");
const request = require("sync-request");

const thingsID =
  "8e719ef942ef52356f7d0d2c3159a497447bb9300697692bf82cc1d7ddb6c646";
const thingsPassword =
  "d72f79104cf77e77f9b96a86adbfe4636fe382fb9608ea03a8a154c5b190ea07";
const host = "172.16.100.1";
const topic = "5484e3b2/home/kitchen";
let token = null;
let socket: any = null;

// Connect to WebSocket server with token
const connect = (token: string) => {
  socket = io(`http://${host}:3000`, {
    reconnect: true,
    query: { token },
  });

  socket.on("connect", () => {
    console.log("Connected to server");
    socket.emit("subscribe", topic);

    // Listen for data on the subscribed topic
    socket.on(`/r/${topic}`, (data: any) => {
      console.log("Received data:", data);
    });
  });

  socket.on("error_msg", (reason: string) => {
    console.error("Error message:", reason);
    if (reason === "Unauthorized") {
      console.log("Refreshing token...");
      getToken(); // Refresh token and reconnect
    }
  });

  socket.on("disconnect", (reason: string) => {
    console.log("Disconnected:", reason);
    if (reason === "io server disconnect") {
      socket.connect(); // Reconnect manually if disconnected by server
    }
  });
};

// Retrieve a new token from the server
const getToken = () => {
  const response = request("POST", `http://${host}/things/request`, {
    json: {
      things_id: thingsID,
      things_password: thingsPassword,
    },
  });

  if (response.statusCode === 200 && response.body) {
    token = JSON.parse(response.body).token;
    console.log("Token retrieved successfully");
    connect(token);
  } else {
    console.error("Failed to retrieve token:", response.body.toString());
    setTimeout(getToken, 10000); // Retry after 10 seconds if unsuccessful
  }
};

// Initialize connection
if (require.main === module) {
  if (!token) {
    getToken();
  } else {
    connect(token);
  }
}
