import twilio from "twilio";
import "dotenv/config";
// Your Twilio Account SID and Auth Token
const accountSid = process.env.TWILIO_SID;
const authToken = process.env.TWILIO_TOKEN;
const phoneNumber = process.env.TWILIO_PHONE_NUMBER;
// Initialize Twilio client
const client = twilio(accountSid, authToken);

client.messages
    .list() // Adjust the limit as needed
    .then((messages) => {
        messages.forEach((message) => {
            console.log(message);

            //   console.log(`From: ${message.from}, To: ${message.to}, Body: ${message.body}, Status: ${message.status}`);
        });
    })
    .catch((err) => {
        console.error("Error fetching messages:", err);
    });
