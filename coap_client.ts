// @ts-ignore
import coap from "coap";
import request from "sync-request";

let token = null;
const things_id =
  "a82fc1123492ce4259fc77e3133d2ca4d45236fc8a0cd5aabdf87454f516b1d9";
const things_password =
  "63a783d373538cf0d2ecb926e6be550cb4204357322214ebb5a4a52c49acf747";
const client_id = "12345";
const host = "172.16.100.1";
const topic = "home";
const maxCounter = 100;
let counter = 0;

const now = () => Date.now();

const connect = (token: string) => {
  const interval = setInterval(() => {
    if (counter >= maxCounter) {
      console.log(`${counter} messages successfully published`);
      clearInterval(interval);
      return;
    }

    const payload = {
      protocol: "coap",
      timestamp: now().toString(),
      topic,
      token,
      humidity: { value: Math.floor(Math.random() * 100), unit: "string" },
      temperature: { value: Math.floor(Math.random() * 100), unit: "string" },
    };

    const req = coap.request({
      host,
      port: "5683",
      pathname: `/r/${topic}`,
      query: `token=${token}`,
      method: "POST",
      confirmable: true,
    });

    const pubStart = now();
    req.write(JSON.stringify(payload));

    req.on("response", (res: any) => {
      if (res.code === "2.01") {
        counter++;
        const pubEnd = now();
        console.log(
          `${counter}; Publish time (sec):; ${(pubEnd - pubStart) / 1000}`
        );
      } else if (res.code === "4.00") {
        console.log(`Unauthorized. Retrying token fetch.`);
        getToken();
      }
    });

    req.on("error", (err: Error) => {
      console.error(`Request error: ${err.message}`);
    });

    req.end();
  }, 3000);
};

const getToken = () => {
  const startTime = now();

  try {
    const response: any = request("POST", `http://${host}/things/request`, {
      json: { things_id: things_id, things_password: things_password },
    });

    if (response.statusCode === 200 && response.body) {
      token = JSON.parse(response.body).token;
      const endTime = now();
      console.log(`Token fetched in ${(endTime - startTime) / 1000} seconds`);
      connect(token);
    } else {
      handleTokenError(response);
    }
  } catch (error: any) {
    console.error(
      `Token request error: ${error.message}. Retrying in 10 seconds.`
    );
    setTimeout(getToken, 10000);
  }
};

const handleTokenError = (response: any) => {
  const data = response.body.toString();
  console.log(`${data} - Retrying token fetch in 10 seconds`);
  setTimeout(getToken, 10000);
};

if (require.main === module) {
  token ? connect(token) : getToken();
}
