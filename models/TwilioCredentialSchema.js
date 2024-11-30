import mongoose from "mongoose";

const TwilioCredentialSchema = new mongoose.Schema({
    userId: { type: String, required: true }, // Unique identifier for the user
    accountSid: { type: String, required: true },
    authToken: { type: String, required: true }
});

const TwilioCredential = mongoose.model("TwilioCredential", TwilioCredentialSchema);

export default TwilioCredential;
