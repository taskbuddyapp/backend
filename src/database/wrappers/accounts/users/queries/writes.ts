// Write operations for the users table
// Return the UserModel interface - does not have the functions implemented
// To use the functions create a new instance of the User class

import { executeQuery } from "../../../../connection";
import { Role, UserModel } from "../../../../models/users/user";

export namespace writes {
    export type PartialUser = {
        uuid: string;
        email: string;
        username: string;
        phone_number: string;
        first_name: string;
        last_name: string;
        password_hash: string;
        role?: Role;
        auth_provider?: string;
    };

    /**
     * Adds a user to the database
     * @param user
     * @returns {Promise<boolean>} true if the user was added, false if it was not
     */
    export async function addUser(
        user: PartialUser
    ): Promise<UserModel | null> {
        try {
            const query =
                "INSERT INTO users (uuid, email, username, first_name, last_name, password_hash, role, auth_provider, phone_number) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *";
            const params = [
                user.uuid,
                user.email,
                user.username,
                user.first_name,
                user.last_name,
                user.password_hash,
                user.role || "user",
                user.auth_provider || "taskbuddy",
                user.phone_number,
            ];
            const result = await executeQuery<UserModel>(query, params);

            return result.length > 0 ? result[0] : null;
        } catch (e) {
            console.error("Error in function `addUser`");
            console.error(e);
            return null;
        }
    }

    /**
     * Updates a user in the database
     * @param user - the user to update
     * @returns {Promise<boolean>} true if the user was updated, false if it was not
     */
    export async function updateUser(user: UserModel): Promise<boolean> {
        try {
            const query =
                "UPDATE users SET username = $1, email = $2, email_verified = $3, first_name = $4, last_name = $5, password_hash = $6, updated_at = $7, last_login = $8, role = $9, token_version = $10, auth_provider = $11, deleted = $12, has_premium = $13, verified = $14, limited_access = $15, phone_number = $16, phone_number_verified = $17 WHERE id = $18 RETURNING *";
            const params = [
                user.username,
                user.email,
                user.email_verified,
                user.first_name,
                user.last_name,
                user.password_hash,
                user.updated_at,
                user.last_login,
                user.role,
                user.token_version,
                user.auth_provider,
                user.deleted,
                user.has_premium,
                user.verified,
                user.limited_access,
                user.phone_number,
                user.phone_number_verified,
                user.id,
            ];
            const result = await executeQuery<UserModel>(query, params);

            return result.length > 0;
        } catch (e) {
            console.error("Error in function `updateUser`");
            console.error(e);
            return false;
        }
    }

    export async function permaDelete(id: number): Promise<boolean> {
        try {
            const query = "DELETE FROM profiles WHERE user_id = $1";
            await executeQuery<UserModel>(query, [id]);

            const q2 = "DELETE FROM users WHERE id = $1";
            await executeQuery<UserModel>(q2, [id]);

            return true;
        } catch (e) {
            console.error("Error in function `permaDelete`");
            console.error(e);
            return false;
        }
    }
}
