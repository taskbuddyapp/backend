// POST /v1/posts - Create a new post

import { Response } from "express";
import { ExtendedRequest } from "../../../types/request";
import { authorize } from "../../../middleware/authorization";
import { requireMethod } from "../../../middleware/require_method";

export default [
    authorize(false),
    requireMethod("POST"),
    (req: ExtendedRequest, res: Response) => {
        try {
            const {
                job_type,
                title,
                description,
                location_lat,
                location_lon,
                location_name,
                is_remote,
                is_urgent,
                price,
                suggestion_radius,
                start_date,
                end_date,
                tags,
            } = req.body;

            const media = req.files;

            console.log(media);

            res.status(200).json({ message: "Post created" });
        } catch (err) {
            return res.status(400).json({ message: "Internal server error" });
        }
    },
];
