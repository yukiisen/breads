import fs from "fs";
import path from "path";

import { RequestHandler } from "express";
import { resError } from "../middlewares/errors";

export default function serveProfilePictures (): RequestHandler {
    return (req, res, next) => {
        const { size, id } = req.params;

        if (!isSize(size) || (/[^0-9a-z]/gi).test(id)) return resError(res, req, 404);

        const filePath = path.join(__dirname, `../../uploads/profiles/${size}/${id}.webp`);

        if (fs.existsSync(filePath)) {
            return res.sendFile(filePath);
        }

        next();
    }
}

const isSize = (size: string) => ["min", "mid", "original"].includes(size);