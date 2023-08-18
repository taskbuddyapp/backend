import { UserModel } from "../database/models/user";
import { signToken, toUserPayload } from "../verification/jwt";

export function getUserResponse(user: UserModel) {
    return {
        user: {
            uuid: user.uuid,
            email: user.email,
            username: user.username,
            phone_number: user.phone_number,
            last_login: user.last_login,
            first_name: user.first_name,
            last_name: user.last_name,
            role: user.role,
            created_at: user.created_at,
        },
        required_actions: {
            // verify_email: !user.email_verified,
            verify_email: false, // Disable email verification because it is not needed
            verify_phone_number: !user.phone_number_verified,
        },
        token: signToken(toUserPayload(user)),
    };
}
