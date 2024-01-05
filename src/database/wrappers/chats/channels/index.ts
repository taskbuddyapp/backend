import { DataModel } from "../../../data_model";
import {
    ChannelFields,
    ChannelModel,
    ChannelStatus,
    ChannelWithRelations,
} from "../../../models/chats/channels";
import { CreateMessageFields } from "../../../models/chats/messages";
import { Profile } from "../../accounts/profiles";
import { User } from "../../accounts/users";
import Post from "../../posts/post";
import Message from "../messages";
import { MessageWrites } from "../messages/wrapper";
import reads from "./queries/reads";
import writes from "./queries/writes";

class Channel extends DataModel implements ChannelModel {
    // Database fields
    id: number;
    uuid: string;
    created_by_id: number;
    recipient_id: number;
    post_id: number;
    status: ChannelStatus;
    negotiated_price: number;
    negotiated_date: Date;
    sharing_location: boolean;
    last_message_time: Date;
    created_at: Date;
    updated_at: Date;

    // Relations
    post: Post;
    created_by: User;
    creator_profile: Profile;
    recipient: User;
    recipient_profile: Profile;
    last_messages: Message[];
    creator_following: boolean;
    recipient_following: boolean;

    constructor(
        channel: ChannelWithRelations,
        refetchOnUpdate: boolean = false
    ) {
        super(refetchOnUpdate);

        // Set data
        Object.assign(this, channel);
        this.refetchOnUpdate = refetchOnUpdate;
    }

    public override async refetch(): Promise<void> {}

    public async update(data: Partial<ChannelFields>): Promise<boolean> {
        try {
            await this._refetch();

            const newData = { ...this, ...data };

            const r = await writes.updateChannel(newData);

            if (r) {
                this.setData(newData);
                return true;
            }

            return false;
        } catch (err) {
            console.error(err);
            return false;
        }
    }

    public async sendMessage(
        message: CreateMessageFields,
        sender: User,
        profile_picture: string = ""
    ): Promise<Message | null> {
        try {
            return await MessageWrites.createMessage(
                message,
                sender,
                profile_picture
            );
        } catch (err) {
            console.error(err);
            return null;
        }
    }

    public async markAsSeen(user_id: number): Promise<boolean> {
        try {
            return await MessageWrites.markAsSeen(this.id, user_id);
        } catch (err) {
            console.error(err);
            return false;
        }
    }

    public async setLastMessageTime(date: Date): Promise<boolean> {
        return await this.update({ last_message_time: date });
    }

    public getOtherUser(user_id: number): User {
        const isChannelCreator = this.created_by_id == user_id;
        const otherUser = isChannelCreator ? this.recipient : this.created_by;

        return otherUser;
    }

    setStatus: (status: ChannelStatus) => Promise<boolean>;
    complete: () => Promise<boolean>;
    cancel: () => Promise<boolean>;
    rejectAsPostOwner: () => Promise<boolean>;
    rejectAsEmployee: () => Promise<boolean>;
    setNegotiatedPrice: (price: number) => Promise<boolean>;
    setNegotiatedDate: (date: Date) => Promise<boolean>;
    setSharingLocation: (sharing: boolean) => Promise<boolean>;
}

export default Channel;
