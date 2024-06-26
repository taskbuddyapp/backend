import { NextFunction, Response } from "express";
import { verifyToken } from "../verification/jwt";
import { ExtendedRequest } from "../types/request";
import { User } from "../database/wrappers/accounts/users";
import { ProfileReads } from "../database/wrappers/accounts/profiles/wrapper";
import { LoginReads } from "../database/wrappers/accounts/logins/wrapper";
import * as killswitches from "../utils/global_killswitches";
import { UserReads } from "../database/wrappers/accounts/users/wrapper";
import { LimitedAccess } from "../database/models/users/user";

// Middleware to authorize a user
export function authorize(
    fetchProfile: boolean = false,
    phoneNumberVerified: boolean = true
) {
    return async (req: ExtendedRequest, res: Response, next: NextFunction) => {
        if (killswitches.isKillswitchEnabled("DISABLE_AUTH")) {
            return res.status(503).json({
                error: "Service Unavailable",
                message: "This service is currently unavailable.",
            });
        }

        // Get the token from the headers
        const token = req.headers["authorization"];

        // If no token, return error
        if (!token) {
            console.error("No token provided");

            return res.status(401).json({
                message: "No token provided",
            });
        }

        // Split the token
        const split = token.split(" ");

        // If the split is not of length 2 or the first item is not 'Bearer', return error
        if (split.length !== 2 || split[0] !== "Bearer") {
            return res.status(401).json({
                message: "Invalid token format",
            });
        }

        // Get the bearer token
        const bearer = split[1];

        // Try to verify the token
        try {
            const decoded = verifyToken(bearer);

            // Get the user by email
            let user: User | null = await UserReads.getUserByEmail(
                decoded.email
            );

            // If there is no user, return error
            if (!user) {
                console.log("No user");

                return res.status(401).json({
                    message: "Invalid token",
                });
            }

            if (!decoded.login_id) {
                console.log("No login id");

                return res.status(401).json({
                    message: "Invalid token",
                });
            }

            if (!(await LoginReads.getLoginById(decoded.login_id))) {
                console.log("Invalid login id");

                return res.status(401).json({
                    message: "Invalid token",
                });
            }

            if (
                phoneNumberVerified &&
                process.env.DISABLE_PHONE_VERIFICATION?.toString() != "true" &&
                !user.phone_number_verified
            ) {
                console.log("Phone number not verified");

                return res.status(403).json({
                    message: "Phone number not verified",
                });
            }

            // If the user is allowed to login, the password hashes match, the emails match
            // and the token versions match, set the req.user to the user
            if (
                !user.hasDisabledAccess(LimitedAccess.SUSPENDED) &&
                decoded.email == user.email &&
                decoded.token_version == user.token_version &&
                decoded.phone_number == user.phone_number &&
                !user.deleted
            ) {
                req.user = user;
                req.login_id = decoded.login_id;

                req.user.id = parseInt(req.user.id as unknown as string);

                // If the profile is requested, fetch it
                if (fetchProfile) {
                    const profile = await ProfileReads.getProfileByUid(user.id);

                    if (profile) {
                        req.profile = profile;
                        req.profile.id = parseInt(
                            req.profile.id as unknown as string
                        );
                    }
                }

                // Call next to continue to the next middleware
                next();
            } else {
                console.log("Invalid token");

                return res.status(401).json({
                    message: "Invalid token",
                });
            }
        } catch (e) {
            console.log(e);
            return res.status(401).json({
                message: "Invalid token",
            });
        }
    };
}

export async function requireAdmin(
    req: ExtendedRequest,
    res: Response,
    next: NextFunction
) {
    const user = req.user!;

    // If the user is not an admin, return error
    if (!user.isAdmin()) {
        return res.status(403).json({
            message: "Forbidden",
        });
    }

    // Call next to continue to the next middleware
    next();
}

type RequireOption = {
    field: string;
    value: any;
};

export async function requireOption(options: RequireOption[]) {
    return (req: ExtendedRequest, res: Response, next: NextFunction) => {
        const user = req.user;

        for (const option of options) {
            // If the user does not have the required field, return error
            // @ts-ignore
            if (user[option.field] != option.value) {
                return res.status(403).json({
                    message: "Forbidden",
                });
            }
        }

        // Call next to continue to the next middleware
        next();
    };
}

export function limitAccess(access: LimitedAccess) {
    return (req: ExtendedRequest, res: Response, next: NextFunction) => {
        const user = req.user;

        if (user!.hasDisabledAccess(access)) {
            return res.status(403).json({
                message: "Forbidden",
            });
        }

        next();
    };
}
