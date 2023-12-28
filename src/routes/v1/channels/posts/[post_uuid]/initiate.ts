// POST /v1/channels/posts/:post_uuid/initiate
// This is to initiate a conversation between the user and the post owner.

import { Response } from "express";
import { authorize } from "../../../../../middleware/authorization";
import { requireMethod } from "../../../../../middleware/require_method";
import { ExtendedRequest } from "../../../../../types/request";
import { BlockReads } from "../../../../../database/wrappers/accounts/blocks/wrapper";
import { PostReads } from "../../../../../database/wrappers/posts/post/wrapper";
import {
    ChannelReads,
    ChannelWrites,
} from "../../../../../database/wrappers/chats/channels/wrapper";
import { getChannelResponse } from "../../responses";

export default [
    requireMethod("POST"),
    authorize(true),
    async (req: ExtendedRequest, res: Response) => {
        try {
            const { post_uuid } = req.params;
            const { message } = req.body;

            if (!post_uuid || !message) {
                return res.status(400).json({
                    message: "Invalid post uuid or message",
                });
            }

            // Check if post exists
            const post = await PostReads.getPostByUUID(post_uuid as any);

            if (!post) {
                return res.status(404).json({
                    message: "Post not found",
                });
            }

            const user = await post.getUser();

            if (!user) {
                return res.status(404).json({
                    message: "User not found",
                });
            }

            // Check if they are blocking each other
            if (
                (await BlockReads.isBlocked(req.user!.id, user.id)) ||
                (await BlockReads.isBlocked(user.id, req.user!.id))
            ) {
                return res.status(403).json({
                    message: "Forbidden",
                });
            }

            // Check if there is already a channel
            const channel = await ChannelReads.getChannelByPostId(
                post.id,
                req.user!.id
            );

            if (channel) {
                return res.status(403).json({
                    message: "Channel already exists",
                });
            }

            // Create channel
            const newChannel = await ChannelWrites.createChannel({
                created_by_id: req.user!.id,
                recipient_id: user.id,
                post_id: post.id,
                negotiated_price: post.price,
                negotiated_date: post.end_date,
            });

            if (!newChannel) {
                return res.status(500).json({
                    message: "Internal server error",
                });
            }

            // TODO: Add message to channel
            user.sendNotification({
                title: "New post request",
                body: `You have a new post request from @${
                    req.user!.username
                }!`,
            });

            // Return channel
            return res.status(200).json({
                message: "Channel created",
                channel: getChannelResponse(newChannel, req.user!),
            });
        } catch (err) {
            console.error(err);
            res.status(500).json({
                message: "Internal server error",
            });
        }
    },
];
