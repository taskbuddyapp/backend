import { remoteConfig } from "firebase-admin";

class RemoteConfigData {
    static minPrice: number = 1;
    static maxPrice: number = 10000;

    static minRadius: number = 5;
    static maxRadius: number = 100;

    static minMedia: number = 1;
    static maxMedia: number = 25;

    static recentMessagesCount: number = 10;

    static maxAttachments: number = 10;

    static searchThreshold: number = 0; // Used for vector search threshold value for similarity search

    static async fetch() {
        const template = await remoteConfig().getTemplate();
        const params = template.parameters;

        // Set the default values

        // @ts-ignore
        this.minPrice = parseInt(params["min_price"].defaultValue.value || 1);
        this.maxPrice = parseInt(
            // @ts-ignore
            params["max_price"].defaultValue.value || 10000
        );

        // @ts-ignore
        this.minRadius = parseInt(params["min_radius"].defaultValue.value || 5);
        this.maxRadius = parseInt(
            // @ts-ignore
            params["max_radius"].defaultValue.value || 100
        );

        // @ts-ignore
        this.minMedia = parseInt(params["min_media"].defaultValue.value || 1);
        // @ts-ignore
        this.maxMedia = parseInt(params["max_media"].defaultValue.value || 25);

        this.recentMessagesCount = parseInt(
            // @ts-ignore
            params["recent_messages_cnt"].defaultValue.value || 10
        );

        this.maxAttachments = parseInt(
            // @ts-ignore
            params["max_attachments"].defaultValue.value || 10
        );

        this.searchThreshold = parseFloat(
            // @ts-ignore
            params["search_threshold"].defaultValue.value || 0
        );
    }
}

export default RemoteConfigData;
