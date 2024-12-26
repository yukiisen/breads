import fs from "fs";
import path from "path";

import { RequestHandler } from "express";
import { resError } from "../middlewares/errors";

export default function serveMedia (): RequestHandler {
    return (req, res, next) => {
        const { id, type } = req.params;

        if (!isMedia(type) || (/[^0-9a-z]/gi).test(id)) return resError(res, req, 404);

        const filePath = path.join(__dirname, `../../uploads/posts/${type}/${id}.webp`);

        if (fs.existsSync(filePath)) {
            return res.sendFile(filePath);
        }

        next();
    }
}

const isMedia = (type: string) => ["images", "videos"].includes(type);