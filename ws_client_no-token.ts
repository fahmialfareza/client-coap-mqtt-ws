// @ts-ignore
import io from "socket.io-client";

const host = "172.16.100.1";
const clientID = "12345";
const topic = "home";
const port = 3000;
let socket: any = null;
let counter = 1;
const maxCounter = 2;

const now = () => Date.now();

const connect = () => {
  const interval = setInterval(() => {
    if (counter <= maxCounter) {
      const connectTime = now();
      socket = io(`http://${host}:${port}`, {
        reconnect: true,
        // Pass token if required
        // query: { token: token }
      });

      socket.on("connect", () => {
        console.log(`Connected to server, subscribing to topic: ${topic}`);
        socket.emit("subscribe", topic);

        const connectDuration = (now() - connectTime) / 1000;
        console.log(`${counter}; Connection time (sec): ${connectDuration}`);

        // Optional: Disconnect after subscribing for testing reconnections
        socket.disconnect();
        counter++;
      });

      socket.on("error_msg", (error: Error) => {
        console.error("Error message received:", error);
      });

      socket.on(`/r/${topic}`, (data: any) => {
        console.log("Data received on topic:", data);
      });

      socket.on("disconnect", (reason: string) => {
        if (reason === "io server disconnect") {
          console.log("Disconnected by server, attempting to reconnect...");
          socket.connect(); // Manually reconnect if server initiated disconnect
        } else {
          console.log("Disconnected from server:", reason);
        }
      });
    } else {
      console.log("Max connections reached, stopping interval.");
      stopInterval(interval);
    }
  }, 2000);
};

const stopInterval = (interval: NodeJS.Timeout) => {
  clearInterval(interval);
  console.log("Connection attempts stopped.");
};

// Start the connection process
if (require.main === module) {
  connect();
}
