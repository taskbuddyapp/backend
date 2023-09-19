export interface KillswitchFields {
    id: number;
    type: string;
    description: string;
    enabled: boolean;
    created_at: Date;
    updated_at: Date;
}

export interface KillswitchModel extends KillswitchFields {
    enable(): Promise<boolean>;
    disable(): Promise<boolean>;
    setEnabled(enabled: boolean): Promise<boolean>;
    setDescription(description: string): Promise<boolean>;
    delete(): Promise<boolean>;
    update(data: Partial<KillswitchModel>): Promise<boolean>;
}

export enum KillswitchTypes {
    DISABLE_ROUTES = "disable_routes",
    DISABLE_AUTH = "disable_auth",
    DISABLE_REGISTRATION = "disable_registration",
    DISABLE_LOGIN = "disable_login",
    DISABLE_ALL = "disable_all",
    DISABLE_FAKE_DELAY = "disable_fake_delay",
}
