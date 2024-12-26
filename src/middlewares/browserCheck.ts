import { RequestHandler } from "express";

import path from "path";

export default function browserCheck (): RequestHandler {
    return (req, res, next) => {
        const ua = req.headers['user-agent'];
        if (!ua) {
            res.status(400).sendFile(path.join(__dirname, "../../pages/errors/400.html"));
            return;
        }

        const oldBrowser = /MSIE|Trident\/|Edge\/(12|13|14)/i.test(ua);

        if (oldBrowser) {
            res.status(426).sendFile(path.join(__dirname, "../../pages/errors/426.html"));
            return;
        }

        next();
    }
}   