// POST /v1/channels/:uuid/actions/worker
// Accepts a worker to a channel

import { Response } from "express";
import { authorize } from "../../../../../middleware/authorization";
import { ChannelRequest, withChannel } from "../middleware";
import { ChannelStatus } from "../../../../../database/models/chats/channels";
import { requireMethod } from "../../../../../middleware/require_method";
import { RequestMessageType } from "../../../../../database/models/chats/messages";
import { getChannelResponse, getMessageResponse } from "../../responses";

export default [
    requireMethod("POST"),
    authorize(true),
    withChannel,
    async (req: ChannelRequest, res: Response) => {
        try {
            const { channel } = req;
            // The verdict is 0 for reject, 1 for accept
            const { verdict } = req.query;

            // Check if the verdict is valid
            if (!verdict || isNaN(parseInt(verdict as string))) {
                return res.status(400).json({
                    message: "Invalid verdict",
                });
            }

            if (channel!.status == ChannelStatus.REJECTED) {
                return res.status(403).json({
                    message: "Forbidden",
                });
            }

            const parsedVerdict = parseInt(verdict as string);

            // Check if the user is the post owner
            if (parsedVerdict == 1 && req.user!.id != channel!.post.user_id) {
                return res.status(403).json({
                    message: "Forbidden",
                });
            }

            // Get the post
            const post = await channel!.getPost();

            if (!post) {
                return res.status(404).json({
                    message: "Post not found",
                });
            }

            if (parsedVerdict == 0) {
                // Reject
                await channel!.setStatus(ChannelStatus.REJECTED);

                req.channel?.created_by.sendSocketEvent("channel_update", {
                    channel: getChannelResponse(
                        req.channel!,
                        req.channel!.created_by
                    ),
                });

                req.channel?.recipient.sendSocketEvent("channel_update", {
                    channel: getChannelResponse(
                        req.channel!,
                        req.channel!.recipient
                    ),
                });

                const m = await req.channel!.sendMessage(
                    {
                        message: `This job has been rejected by ${
                            req.user!.first_name
                        } ${req.user!.last_name}.`,
                        system_message: true,
                        channel_id: req.channel!.id,
                    },
                    null
                );

                req.channel?.getOtherUser(req.user!.id).sendNotification({
                    title: `${req.user!.first_name} ${req.user!.last_name}`,
                    body: "Rejected your job request",
                    imageUrl:
                        req.profile!.profile_picture?.length > 0
                            ? req.profile!.profile_picture
                            : undefined,
                    data: {
                        type: "channel",
                        channel_uuid: req.channel!.uuid,
                    },
                });

                if (m) {
                    req.channel
                        ?.getOtherUser(req.user!.id)
                        .sendSocketEvent("chat", {
                            message: getMessageResponse(
                                m,
                                req.channel!.getOtherUser(req.user!.id),
                                req.channel!.uuid
                            ),
                        });

                    req.user!.sendSocketEvent("chat", {
                        message: getMessageResponse(
                            m,
                            req.user!,
                            req.channel!.uuid
                        ),
                    });
                }

                return res.status(200).json({
                    message: "Worker rejected",
                });
            } else if (parsedVerdict == 1) {
                // Send a request message to the worker to accept
                const message = await channel!.sendMessage(
                    {
                        sender_id: req.user!.id,
                        channel_id: channel!.id,
                        message: "",
                        request: {
                            request_type: RequestMessageType.DEAL,
                        },
                        attachments: [],
                        system_message: false,
                    },
                    req.user!,
                    req.profile!.profile_picture
                );

                if (!message) {
                    return res.status(500).json({
                        message: "Internal server error",
                    });
                }

                res.status(200).json({
                    message: getMessageResponse(
                        message!,
                        req.user!,
                        channel!.uuid
                    ),
                });

                const otherUser = channel!.getOtherUser(req.user!.id);

                // Send push notification
                await otherUser.sendNotification({
                    title: `${req.user!.first_name} ${req.user!.last_name}`,
                    body: "Sent a deal request",
                    imageUrl:
                        req.profile!.profile_picture?.length > 0
                            ? req.profile!.profile_picture
                            : undefined,
                    data: {
                        type: "message",
                        channel_uuid: req.channel!.uuid,
                        message_uuid: message!.uuid,
                    },
                });

                // Send socket event
                otherUser.sendSocketEvent("chat", {
                    message: getMessageResponse(
                        message,
                        otherUser,
                        channel!.uuid
                    ),
                });

                req.channel!.setLastMessageTime(new Date());
            } else {
                res.status(400).json({
                    message: "Invalid verdict",
                });
            }
        } catch (error) {
            console.error(error);

            res.status(500).json({
                message: "Internal server error",
            });
        }
    },
];
