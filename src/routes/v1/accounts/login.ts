// /v1/accounts/login - Checks e-mail and password combo
// Uses Cloudflare's Turnstile captcha
import { Response } from "express";
import { requireMethod } from "../../../middleware/require_method";
import { getUserByEmail } from "../../../database/accounts/users";
import { sleep } from "../../../utils/utils";
import { comparePassword } from "../../../utils/bcrypt";
import { getUserResponse } from "../../../utils/responses";
import { ExtendedRequest } from "../../../types/request";
import { checkCaptcha } from "../../../verification/captcha";

export default [requireMethod("POST"), async (req: ExtendedRequest, res: Response) => {
    const { email, password, captcha } = req.body;

    if (!email || !password || !captcha) {
        return res.status(400).json({
            message: "Missing required parameters"
        });
    }

    if (!checkCaptcha(captcha, req.ip)) {
        return res.status(400).json({
            message: "Invalid captcha"
        });
    }

    try {
        const user = await getUserByEmail(email);

        if (!user) {
            await sleep(200); // Prevent timing attacks
            return res.status(401).json({
                message: "Invalid email or password"
            });
        }

        if (!comparePassword(password, user.password_hash)) {
            return res.status(401).json({
                message: "Invalid email or password"
            });
        }

        user.addLogin(req.ip, req.userAgent);

        res.status(200).json(getUserResponse(user));
    }
    catch (e) {
        console.error(e);

        return res.status(500).json({
            message: "Internal server error"
        });
    }
}];