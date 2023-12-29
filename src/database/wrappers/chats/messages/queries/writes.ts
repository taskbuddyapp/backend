import { v4 } from "uuid";
import { executeQuery } from "../../../../connection";
import {
    AttachmentType,
    CreateMessageFields,
    MessageAttachmentFields,
    MessageFields,
    MessageWithRelations,
    RequestMessageFields,
    RequestMessageType,
} from "../../../../models/chats/messages";
import reads from "./reads";
import { User } from "../../../accounts/users";

namespace writes {
    async function generateUUID(): Promise<string | null> {
        try {
            do {
                const uuid = v4();

                const result = await executeQuery(
                    `SELECT id FROM messages WHERE uuid = $1`,
                    [uuid]
                );

                if (result.length == 0) return uuid;
            } while (true);
        } catch (err) {
            console.error(err);
            return null;
        }
    }

    export async function createMessage(
        data: CreateMessageFields,
        sender: User,
        profile_picture: string
    ): Promise<MessageWithRelations | null> {
        try {
            const uuid = await generateUUID();

            if (!uuid) return null;

            // Create a message entry
            const createMessageQuery = `
                INSERT INTO messages (
                    uuid,
                    channel_id,
                    sender_id,
                    system_message,
                    message
                ) VALUES (
                    $1, $2, $3, $4, $5
                ) RETURNING *
            `;

            const createMessageParams = [
                uuid,
                data.channel_id,
                data.sender_id,
                data.system_message,
                data.message,
            ];

            const result = await executeQuery<MessageFields>(
                createMessageQuery,
                createMessageParams
            );

            if (result.length == 0) return null;

            const message = result[0];

            let attachments: MessageAttachmentFields[] = [];

            if (data.attachments) {
                for (const attachment of data.attachments) {
                    const createAttachmentQuery = `
                        INSERT INTO message_attachments (
                            message_id,
                            attachment_type,
                            attachment_url
                        ) VALUES (
                            $1, $2, $3
                        )
                    `;

                    const createAttachmentParams = [
                        message.id,
                        attachment.attachment_type,
                        attachment.attachment_url,
                    ];

                    const r = await executeQuery(
                        createAttachmentQuery,
                        createAttachmentParams
                    );

                    if (r.length > 0)
                        attachments.push(r[0] as MessageAttachmentFields);
                }
            }

            let request: RequestMessageFields | null = null;

            if (data.request) {
                const createRequestQuery = `
                    INSERT INTO request_messages (
                        message_id,
                        request_type
                    ) VALUES (
                        $1, $2
                    )
                `;

                const createRequestParams = [
                    message.id,
                    data.request.request_type,
                ];

                const r = await executeQuery(
                    createRequestQuery,
                    createRequestParams
                );

                if (r.length > 0) request = r[0] as RequestMessageFields;
            }

            return {
                sender,
                attachments,
                request,
                ...message,
                profile_picture,
            };
        } catch (err) {
            console.error(err);
            return null;
        }
    }

    export async function updateMessageRelations(
        data: MessageWithRelations
    ): Promise<boolean> {
        try {
            const updateMessageQuery = `
                UPDATE messages SET
                    channel_id = $1,
                    sender_id = $2,
                    system_message = $3,
                    message = $4,
                    seen = $5,
                    seen_at = $6,
                    edited = $7,
                    edited_at = $8,
                    deleted = $9
                WHERE id = $10
            `;

            const updateMessageParams = [
                data.channel_id,
                data.sender_id,
                data.system_message,
                data.message,
                data.seen,
                data.seen_at,
                data.edited,
                data.edited_at,
                data.deleted,
                data.id,
            ];

            await executeQuery(updateMessageQuery, updateMessageParams);

            // Update attachments

            if (data.attachments) {
                const deleteAttachmentsQuery = `
                    DELETE FROM message_attachments WHERE message_id = $1
                `;

                const deleteAttachmentsParams = [data.id];

                await executeQuery(
                    deleteAttachmentsQuery,
                    deleteAttachmentsParams
                );

                for (const attachment of data.attachments) {
                    const createAttachmentQuery = `
                        INSERT INTO message_attachments (
                            message_id,
                            attachment_type,
                            attachment_url
                        ) VALUES (
                            $1, $2, $3
                        )
                    `;

                    const createAttachmentParams = [
                        data.id,
                        attachment.attachment_type,
                        attachment.attachment_url,
                    ];

                    await executeQuery(
                        createAttachmentQuery,
                        createAttachmentParams
                    );
                }
            }

            // Delete request
            await executeQuery(
                "DELETE FROM request_messages WHERE message_id = $1",
                [data.id]
            );

            // Update request
            if (data.request) {
                const createRequestQuery = `
                    INSERT INTO request_messages (
                        message_id,
                        request_type
                    ) VALUES (
                        $1, $2
                    )
                `;

                const createRequestParams = [
                    data.id,
                    data.request.request_type,
                ];

                await executeQuery(createRequestQuery, createRequestParams);
            }

            return true;
        } catch (err) {
            console.error(err);
            return false;
        }
    }

    export async function updateMessage(data: MessageFields): Promise<boolean> {
        try {
            const q = `
            UPDATE messages
            SET
                uuid = $1,
                channel_id = $2,
                sender_id = $3,
                system_message = $4,
                message = $5,
                seen = $6,
                seen_at = $7,
                edited = $8,
                edited_at = $9,
                deleted = $10
            WHERE id = $11 RETURNING *
            `;

            const p = [
                data.uuid,
                data.channel_id,
                data.sender_id,
                data.system_message,
                data.message,
                data.seen,
                data.seen_at,
                data.edited,
                data.edited_at,
                data.deleted,
                data.id,
            ];

            const res = await executeQuery(q, p);

            return res.length > 0;
        } catch (err) {
            console.error(err);
            return false;
        }
    }

    export async function updateRequestMessage(
        data: RequestMessageFields
    ): Promise<boolean> {
        try {
            const q = `
            UPDATE request_messages
            SET
                message_id = $1,
                status = $2,
                request_type = $3,
                updated_at = NOW()
            `;

            const p = [data.message_id, data.status, data.request_type];

            const res = await executeQuery(q, p);

            return res.length > 0;
        } catch (err) {
            console.error(err);
            return false;
        }
    }

    export async function deleteMessage(id: number): Promise<boolean> {
        try {
            await executeQuery(
                `UPDATE messages
                SET
                    deleted = TRUE,
                    updated_at = NOW()
                WHERE id = $1`,
                [id]
            );

            return true;
        } catch (err) {
            console.error(err);
            return false;
        }
    }
}

export default writes;
