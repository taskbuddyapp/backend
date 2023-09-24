import { Request } from "express";
import { User } from "../database/accounts/users";
import { UploadedFile } from "express-fileupload";
import { Profile } from "../database/accounts/profiles";

export interface ExtendedRequest extends Request {
    userAgent: string;
    user: User;
    profile?: Profile | null;
    files: { [key: string]: UploadedFile };
}
