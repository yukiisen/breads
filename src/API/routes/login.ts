import passport from "passport";
import winston from "../../lib/logger";

import { RequestHandler, Response } from "express";
import { BV } from "../../middlewares/validateBody";

export default function login (): RequestHandler {
    return async (req, res) => {
        try {
            passport.authenticate("localAuth", {
                successRedirect: '/API/authed',
                failureRedirect: '/API/authed'
            })(req, res);
        } catch (error) {
            return winston.error(<Error>error);
        }
    }
}

export const loginShema = {
    username: BV.string,
    password: BV.string
}