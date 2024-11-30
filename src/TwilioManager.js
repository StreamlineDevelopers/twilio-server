import twilio from "twilio";
import axios from "axios";
import "dotenv/config";

class TwilioManager {
    constructor(accountSid = null, authToken = null) {
        this.accountSid = accountSid;
        this.authToken = authToken;
        this.client = accountSid && authToken ? twilio(accountSid, authToken) : null;
    }

    /**
     * Set Twilio credentials dynamically.
     * @param {string} authToken - Twilio Auth Token.
     */
    setCredentials(accountSid, authToken) {
        this.accountSid = accountSid;
        this.authToken = authToken;
        this.client = twilio(accountSid, authToken);
        console.log("Twilio credentials updated.");
    }

    /**
     * Sends an SMS message.
     * @param {string} to - Recipient's phone number.
     * @param {string} body - The message body.
     * @param {string} [from=this.phoneNumber] - Sender's phone number.
     * @returns {Promise<string>} - The message SID if successful.
     */
    async sendSMS(to, body, from = this.phoneNumber) {
        try {
            const message = await this.client.messages.create({
                body,
                to,
                from
            });

            console.log(message);

            console.log(`Message sent: ${message.sid}`);
            return message.sid;
        } catch (error) {
            console.error("Error sending message:", error);
            throw error;
        }
    }

    /**
     * Fetches SMS logs.
     * @param {number} [limit=20] - Number of messages to fetch.
     * @returns {Promise<Array>} - List of message logs.
     */
    async fetchMessageLogs(limit = 20) {
        try {
            const messages = await this.client.messages.list({ limit });
            return messages.map(({ from, to, body, status, dateSent }) => ({
                from,
                to,
                body,
                status,
                dateSent
            }));
        } catch (error) {
            console.error("Error fetching message logs:", error);
            throw error;
        }
    }

    /**
     * Handles incoming SMS.
     * @param {object} req - Express request object.
     * @param {object} res - Express response object.
     */
    async handleIncomingSMS(req, res) {
        try {
            // Forward the incoming SMS data to another service
            await axios.post("http://localhost:4000/receive-sms", req.body);
            console.log("Incoming SMS forwarded successfully.");
            res.status(200).json({ status: "success" });
        } catch (error) {
            console.error("Error forwarding incoming SMS:", error);
            res.status(500).json({ error: "Failed to forward SMS." });
        }
    }

    /**
     * Fetches all active phone numbers associated with the Twilio account.
     * @returns {Promise<Array>} - List of active phone numbers.
     */
    async fetchActivePhoneNumbers() {
        try {
            const phoneNumbers = await this.client.incomingPhoneNumbers.list();
            return phoneNumbers;
        } catch (error) {
            console.error("Error fetching active phone numbers:", error);
            throw error;
        }
    }

    /**
     * Fetches a list of all virtual phone numbers associated with the Twilio account.
     * @returns {Promise<Array>} - List of virtual phone numbers.
     */
    async fetchVirtualPhoneNumbers() {
        if (!this.client) {
            throw new Error("Twilio client is not initialized. Set credentials first.");
        }
        try {
            const phoneNumbers = await this.client.incomingPhoneNumbers.list();
            return phoneNumbers.map((number) => ({
                sid: number.sid,
                phoneNumber: number.phoneNumber,
                friendlyName: number.friendlyName,
                capabilities: number.capabilities
            }));
        } catch (error) {
            console.error("Error fetching virtual phone numbers:", error);
            throw error;
        }
    }

    /**
     * Fetches available phone numbers for purchase in a specific country.
     * @param {string} countryCode - The ISO 3166-1 alpha-2 country code (e.g., 'US' for the United States).
     * @param {object} [options] - Additional search filters (e.g., type, areaCode).
     * @returns {Promise<Array>} - List of available phone numbers with their pricing.
     */
    async fetchAvailableNumbers(countryCode, options = {}) {
        if (!this.client) {
            throw new Error("Twilio client is not initialized. Set credentials first.");
        }

        try {
            // Fetch available phone numbers
            const availableNumbers = await this.client.availablePhoneNumbers(countryCode).local.list(options);
            // // Map phone numbers with pricing details
            // const phoneNumbersWithPricing = await Promise.all(
            //     availableNumbers.map(async (number) => {
            //         try {
            //             // Fetch pricing for the phone number
            //             const pricingResponse = await this.client.pricing.v1.phoneNumbers.countries(countryCode).fetch();

            //             const price = pricingResponse.phoneNumberPrices.find((price) => price.numberType === "local");

            //             return {
            //                 phoneNumber: number.phoneNumber,
            //                 friendlyName: number.friendlyName,
            //                 price: price ? price.basePrice : "Unknown",
            //                 capabilities: number.capabilities
            //             };
            //         } catch (pricingError) {
            //             console.error("Error fetching pricing for number:", pricingError);
            //             return {
            //                 phoneNumber: number.phoneNumber,
            //                 friendlyName: number.friendlyName,
            //                 price: "Error fetching price",
            //                 capabilities: number.capabilities
            //             };
            //         }
            //     })
            // );

            return availableNumbers;
        } catch (error) {
            console.error("Error fetching available numbers:", error);
            throw error;
        }
    }

    /**
     * Creates a new Twilio subaccount.
     * @param {string} friendlyName - The name for the subaccount.
     * @returns {Promise<object>} - Details of the created subaccount.
     */
    async createSubAccount(friendlyName) {
        if (!this.client) {
            throw new Error("Twilio client is not initialized. Set credentials first.");
        }

        try {
            const subAccount = await this.client.api.accounts.create({ friendlyName });
            return {
                sid: subAccount.sid,
                authToken: subAccount.authToken,
                status: subAccount.status,
                friendlyName: subAccount.friendlyName,
                dateCreated: subAccount.dateCreated,
                dateUpdated: subAccount.dateUpdated
            };
        } catch (error) {
            console.error("Error creating subaccount:", error);
            throw error;
        }
    }

    /**
     * Fetches all Twilio subaccounts.
     * @returns {Promise<Array>} - List of subaccounts.
     */
    async fetchSubAccounts() {
        if (!this.client) {
            throw new Error("Twilio client is not initialized. Set credentials first.");
        }

        try {
            const subAccounts = await this.client.api.accounts.list();
            return subAccounts.map((account) => ({
                sid: account.sid,
                friendlyName: account.friendlyName,
                status: account.status,
                dateCreated: account.dateCreated,
                dateUpdated: account.dateUpdated
            }));
        } catch (error) {
            console.error("Error fetching subaccounts:", error);
            throw error;
        }
    }
}

export default TwilioManager;
