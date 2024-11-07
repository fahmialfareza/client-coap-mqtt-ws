// @ts-ignore
import coap from "coap";

const host = "172.16.100.1";
const topic = "home";
const port = 5683;
const client_id = "12345"; // Defined for potential future use

// Generate the current timestamp
const now = () => Date.now();

// Connect function for publishing CoAP messages
const connect = () => {
  let counter = 0;
  const maxCounter = 100;
  const interval = setInterval(() => {
    if (counter < maxCounter) {
      // Prepare the payload
      const payload = {
        protocol: "coap",
        timestamp: now().toString(),
        topic: topic,
        humidity: {
          value: Math.floor(Math.random() * 100),
          unit: "string",
        },
        temperature: {
          value: Math.floor(Math.random() * 100),
          unit: "string",
        },
      };

      const pubStart = now(); // Track publish start time

      // Set up the CoAP request
      const req = coap.request({
        host: host,
        port: port.toString(),
        pathname: `/r/${topic}`,
        method: "POST",
        confirmable: true,
      });

      req.write(JSON.stringify(payload)); // Send the payload

      req.on("response", (res: any) => {
        if (res.code === "2.01") {
          counter++;
          const pubEnd = now();
          console.log(
            `${counter}; pub time (sec): ${((pubEnd - pubStart) / 1000).toFixed(
              2
            )}`
          );
        } else if (res.code === "4.01") {
          console.error("Unauthorized:", res.payload.toString());
        }
      });

      req.on("error", (err: Error) => {
        console.error("Request error:", err.message);
      });

      req.end(); // Complete the request
    } else {
      console.log(`${counter} messages successfully published`);
      clearInterval(interval); // Stop the interval after max count
    }
  }, 3000); // Interval set to 3 seconds
};

// Run the connect function if this module is the main entry point
if (require.main === module) {
  connect();
}
