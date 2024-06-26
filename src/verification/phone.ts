// Used for verifying user phone numbers via SMS or call

import twilio from "twilio";
import { accountSid, authToken, verifySid } from "../config";
import { User } from "../database/wrappers/accounts/users";
import { UserReads } from "../database/wrappers/accounts/users/wrapper";

// Create a Twilio client
const client = twilio(accountSid, authToken);

// Send an OTP to the user's phone number via a specific channel (SMS or call)
async function sendOTPViaChannel(uuid: string, channel: string) {
    const user = await UserReads.getUserByUUID(uuid);

    if (!user) {
        throw new Error("User not found");
    }

    const result = await client.verify.v2
        .services(verifySid)
        .verifications.create({ to: user.phone_number, channel });

    return result;
}

// Send an OTP to the user's phone number
export async function sendOTP(uuid: string) {
    return await sendOTPViaChannel(uuid, "sms");
}

// Call the user's phone number with an OTP
export async function callOTP(uuid: string) {
    return await sendOTPViaChannel(uuid, "call");
}

// Verify the OTP sent to the user's phone number
export async function verifyOTP(uuid: string, code: string) {
    let user = await UserReads.getUserByUUID(uuid);

    if (!user) {
        throw new Error("User not found");
    }

    if (!user.phone_number) {
        throw new Error("User does not have a phone number");
    }

    user = new User(user);

    // Send the verification code to Twilio and get the result
    // Twilio automatically handles the code checking, so we don't need to do it ourselves
    const result = await client.verify.v2
        .services(verifySid)
        .verificationChecks.create({ to: user.phone_number, code });

    return result;
}

// Check if a phone number is a VoIP number
export async function isVoIPNumber(number: string): Promise<boolean> {
    try {
        const response = await client.lookups.v2
            .phoneNumbers(number)
            .fetch({ fields: "line_type_intelligence" }); // Only fetch the line type intelligence

        return response.lineTypeIntelligence.type
            .toLowerCase()
            .includes("voip");
    } catch (err) {
        console.log(err);
        return true;
    }
}

// Check if a phone number existis
export async function doesNumberExist(number: string) {
    try {
        const response = await client.lookups.v2.phoneNumbers(number).fetch({}); // Don't fetch anything - saves money

        return response.valid;
    } catch (err) {
        console.log(err);
        return false;
    }
}
