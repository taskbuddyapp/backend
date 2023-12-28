import { User } from "../../../database/wrappers/accounts/users";
import Channel from "../../../database/wrappers/chats/channels";
import { getPublicUserProfileResponse } from "../accounts/responses";
import { getPostResultResponse } from "../posts/responses";

export function getChannelResponse(channel: Channel, requester: User) {
    const isUserCreator = requester.id == channel.created_by.id;

    return {
        uuid: channel.uuid,
        post: getPostResultResponse(channel.post, requester),
        channel_creator: getPublicUserProfileResponse(
            channel.created_by,
            channel.creator_profile,
            // is following?
            isUserCreator ? false : channel.recipient_following,
            isUserCreator
        ),
        channel_recipient: getPublicUserProfileResponse(
            channel.recipient,
            channel.recipient_profile,
            // is following?
            isUserCreator ? channel.creator_following : false,
            !isUserCreator
        ),
        last_message_time: channel.last_message_time,
        created_at: channel.created_at,
    };
}