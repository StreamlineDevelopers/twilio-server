import twilio from "twilio";
import "dotenv/config";
// Your Twilio Account SID and Auth Token
const accountSid = process.env.TWILIO_SID;
const authToken = process.env.TWILIO_TOKEN;
const phoneNumber = process.env.TWILIO_PHONE_NUMBER;
// Initialize Twilio client
const client = twilio(accountSid, authToken);

// Function to send SMS
client.messages
  .create({
    body: "Hello from Twilio!",
    to: "",
    from: phoneNumber
  })
  .then((message) => console.log(message.sid))
  .catch((error) => console.error(error));

