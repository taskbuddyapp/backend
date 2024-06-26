import { Login } from "../../wrappers/accounts/logins";

export enum LimitedAccess {
    SUSPENDED = "suspended",
    DISABLED_PREMIUM = "disabled_premium",
    DISABLED_LISTING = "disabled_listing",
    DISABLED_CHAT = "disabled_chat",
}

export type Role = "user" | "admin";

export interface UserFields {
    id: number;
    uuid: string;
    username: string;
    email: string;
    email_verified: boolean;
    phone_number: string;
    phone_number_verified: boolean;
    first_name: string;
    last_name: string;
    password_hash: string;
    created_at: Date;
    updated_at: Date;
    last_login: Date;
    role: Role;
    token_version: number;
    auth_provider: string;
    deleted: boolean;
    has_premium: boolean;
    limited_access: LimitedAccess[];
    verified: boolean;
}

export interface UserModel extends UserFields {
    update: (data: Partial<UserModel>) => Promise<boolean>;
    addLogin: (ip: string, userAgent: string) => Promise<Login | null>;
    deleteUser: () => Promise<boolean>;
    changePassword: (newPassword: string) => Promise<boolean>;
    comparePassword: (password: string) => Promise<boolean>;
    refetch: () => Promise<void>;
    hasDisabledAccess: (access: LimitedAccess) => boolean;
    addDisabledAccess: (access: LimitedAccess) => Promise<boolean>;
    removeDisabledAccess: (access: LimitedAccess) => Promise<boolean>;
    hasRole: (role: Role) => boolean;
    isAdmin: () => boolean;
    setRole: (role: Role) => Promise<boolean>;
    setPremium: (premium: boolean) => Promise<boolean>;
    setPhoneNumber: (phoneNumber: string) => Promise<boolean>;
    setPhoneNumberVerified: (verified: boolean) => Promise<boolean>;
    logOutOfAllDevices: () => Promise<boolean>;
    setVerified: (verified: boolean) => Promise<boolean>;
    isFollowing: (user_id: number) => Promise<boolean>;
}
