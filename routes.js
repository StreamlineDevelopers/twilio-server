
import twilio from "twilio";
import axios from "axios";
import "dotenv/config";

const routes = (app) => {
    app.route("/send-sms").post(async (req, res) => {
        console.log("Sending message..." + req.body.to);
        const from = req.body.from;
        const to = req.body.to;
        const body = req.body.message;
        
        const accountSid = process.env.TWILIO_SID;
        const authToken = process.env.TWILIO_TOKEN;

        const phoneNumber = from || process.env.TWILIO_PHONE_NUMBER;
        // Initialize Twilio client
        const client = twilio(accountSid, authToken);

        // Function to send SMS
        const messageId = await client.messages
            .create({
                body: body,
                to: to,
                from: phoneNumber
            })

        res.json({ messageId: messageId.sid });

    });
    app.route("/receive-sms").post((req, res) => {
        axios.post("http://localhost:4000/receive-sms", req.body).then((response) => {
            console.log("Email sent to server:", response.data.message);
        }).catch((error) => {
            console.error("Error sending email to server:", error);
        });

        res.json({ status: "success" });
    });
};

export default routes;
