import { User } from "../../../database/wrappers/accounts/users";
import Channel from "../../../database/wrappers/chats/channels";
import Message from "../../../database/wrappers/chats/messages";
import { getPublicUserProfileResponse } from "../accounts/responses";
import { getPostOnlyResponse } from "../posts/responses";

export function getChannelResponse(channel: Channel, requester: User) {
    if (!channel || !channel.created_by || !channel.recipient) {
        return null;
    }

    const isUserCreator = requester.id == channel.created_by.id;

    return {
        uuid: channel.uuid,
        post: getPostOnlyResponse(channel.post),
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
        last_message_time: channel.last_message_time.toISOString(),
        created_at: channel.created_at,
        last_messages: channel.last_messages.map((message) =>
            getMessageResponse(message, requester, channel.uuid)
        ),
        other_user: isUserCreator ? "recipient" : "creator",
        status: channel.status,
        is_post_creator: channel.post.user_id == requester.id,
        negotiated_price: channel.negotiated_price,
        negotiated_date: channel.negotiated_date.toISOString(),
    };
}

export function getMessageResponse(
    message: Message,
    requester: User,
    channel_uuid: string
) {
    if (!message) {
        return null;
    }

    return {
        uuid: message.uuid,
        channel_uuid: channel_uuid,
        deleted: message.deleted,
        message: message.deleted ? "" : message.message,
        sender: message.sender && {
            uuid: message.sender.uuid,
            username: message.sender.username,
            first_name: message.sender.first_name,
            last_name: message.sender.last_name,
            profile_picture: message.profile_picture,
            is_me: message.sender.id == requester.id,
        },
        request: message.deleted
            ? null
            : message.request
            ? {
                  status: message.request.status,
                  type: message.request.request_type,
                  data: message.request.data,
              }
            : null,
        attachments: message.deleted
            ? []
            : message.attachments?.map((attachment) => ({
                  type: attachment.attachment_type,
                  url: attachment.attachment_url,
              })) ?? [],
        created_at: message.created_at,
        edited: message.edited,
        edited_at: message.edited_at,
        seen: message.seen,
        seen_at: message.seen_at,
    };
}
