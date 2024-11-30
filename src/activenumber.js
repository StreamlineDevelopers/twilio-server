import twilio from "twilio";
import "dotenv/config";
// Your Twilio Account SID and Auth Token
const accountSid = process.env.TWILIO_SID;
const authToken = process.env.TWILIO_TOKEN;
const phoneNumber = process.env.TWILIO_PHONE_NUMBER;
// Initialize Twilio client
const client = twilio(accountSid, authToken);

client.incomingPhoneNumbers
    .list() // Adjust the limit as needed
    .then((data) => {
        console.log(data);
    })
    .catch((err) => {
        console.error("Error fetching messages:", err);
    });
