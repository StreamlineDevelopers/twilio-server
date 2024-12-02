import TwilioManager from "./src/TwilioManager.js";
import TwilioCredential from "./models/TwilioCredentialSchema.js";
import axios from "axios";
import "dotenv/config";

const routes = (app) => {
    // Middleware to fetch and set Twilio credentials for the user
    const setTwilioManagerForUser = async (req, res, next) => {
        const { userId } = req.body;
        if (!userId) {
            return res.status(400).json({ error: "userId is required" });
        }

        try {
            const credential = await TwilioCredential.findOne({ userId });
            if (!credential) {
                return res.status(404).json({ error: "No Twilio credentials found for this user." });
            }

            // Attach a TwilioManager instance to the request
            req.twilioManager = new TwilioManager(credential.accountSid, credential.authToken);
            req.phoneNumber = credential.phoneNumber; // Save phone number for sending messages
            next();
        } catch (error) {
            console.error("Error fetching Twilio credentials:", error);
            res.status(500).json({ error: "Failed to fetch Twilio credentials." });
        }
    };

    // Route to send SMS
    app.post("/send-sms", setTwilioManagerForUser, async (req, res) => {
        const { to, message, from } = req.body;

        try {
            const messageId = await req.twilioManager.sendSMS(to, message, from);
            res.json({ messageId });
        } catch (error) {
            console.error("Error sending SMS:", error);
            res.status(500).json({ error: "Failed to send SMS." });
        }
    });

    // Route to fetch active Twilio phone numbers
    app.get("/fetch-active-phone-numbers", setTwilioManagerForUser, async (req, res) => {
        try {
            const phoneNumbers = await req.twilioManager.fetchActivePhoneNumbers();
            res.json(phoneNumbers);
        } catch (error) {
            console.error("Error fetching active phone numbers:", error);
            res.status(500).json({ error: "Failed to fetch active phone numbers." });
        }
    });

    // Route to fetch Twilio virtual phone numbers
    app.post("/fetch-virtual-phone-numbers", setTwilioManagerForUser, async (req, res) => {
        try {
            const virtualPhoneNumbers = await req.twilioManager.fetchVirtualPhoneNumbers();
            res.json(virtualPhoneNumbers);
        } catch (error) {
            console.error("Error fetching virtual phone numbers:", error);
            res.status(500).json({ error: "Failed to fetch virtual phone numbers." });
        }
    });

    // Route to send SMS using a virtual phone number
    app.post("/send-sms-virtual", setTwilioManagerForUser, async (req, res) => {
        const { to, message, virtualPhoneNumber } = req.body;

        if (!virtualPhoneNumber) {
            return res.status(400).json({ error: "virtualPhoneNumber is required." });
        }

        try {
            const messageId = await req.twilioManager.sendSMS(to, message, virtualPhoneNumber);
            res.json({ messageId });
        } catch (error) {
            console.error("Error sending SMS using virtual phone number:", error);
            res.status(500).json({ error: "Failed to send SMS using virtual phone number." });
        }
    });

    app.post("/fetch-available-numbers", setTwilioManagerForUser, async (req, res) => {
        console.log("Fetching available numbers:", req.body);

        const { countryCode, areaCode } = req.body;

        if (!countryCode) {
            return res.status(400).json({ error: "countryCode is required." });
        }

        try {
            const availableNumbers = await req.twilioManager.fetchAvailableNumbers(countryCode, {
                areaCode
            });
            res.json(availableNumbers);
        } catch (error) {
            console.error("Error fetching available numbers:", error);
            res.status(500).json({ error: "Failed to fetch available numbers." });
        }
    });

    // Route to add or update Twilio credentials for a user
    app.post("/set-twilio-credentials", async (req, res) => {
        console.log("Setting Twilio credentials:", req.body);

        const { userId, accountSid, authToken } = req.body;

        if (!userId || !accountSid || !authToken) {
            return res.status(400).json({ error: "All fields are required." });
        }

        try {
            const existingCredential = await TwilioCredential.findOne({ userId });
            if (existingCredential) {
                // Update existing credentials
                existingCredential.accountSid = accountSid;
                existingCredential.authToken = authToken;
                await existingCredential.save();
            } else {
                // Create new credentials
                const newCredential = new TwilioCredential({
                    userId,
                    accountSid,
                    authToken
                });
                await newCredential.save();
            }

            res.json({ message: "Twilio credentials saved successfully." });
        } catch (error) {
            console.error("Error saving Twilio credentials:", error);
            res.status(500).json({ error: "Failed to save Twilio credentials." });
        }
    });

    app.post("/create-subaccount", setTwilioManagerForUser, async (req, res) => {
        console.log("Creating subaccount...");

        const { friendlyName } = req.body;

        if (!friendlyName) {
            return res.status(400).json({ error: "friendlyName is required." });
        }

        try {
            const subAccount = await req.twilioManager.createSubAccount(friendlyName);
            res.json(subAccount);
        } catch (error) {
            console.error("Error creating subaccount:", error);
            res.status(500).json({ error: error.message });
        }
    });

    // Route to fetch all Twilio subaccounts
    app.get("/fetch-subaccounts", setTwilioManagerForUser, async (req, res) => {
        try {
            const subAccounts = await req.twilioManager.fetchSubAccounts();
            res.json(subAccounts);
        } catch (error) {
            console.error("Error fetching subaccounts:", error);
            res.status(500).json({ error: "Failed to fetch subaccounts." });
        }
    });

    app.route("/receive-sms").post((req, res) => {
        // replace with you own email
        axios
            .post(`${process.env.FRONTEND_URL}/receive-sms`, req.body)
            .then((response) => {
                console.log("Email sent to server:", response.data.message);
            })
            .catch((error) => {
                console.error("Error sending email to server:", error);
            });
        res.json({ status: "success" });
    });
};

export default routes;
