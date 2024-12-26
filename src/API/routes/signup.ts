import db from "../../lib/database";
import bcrypt from "bcrypt";
import winston from "../../lib/logger";
import zxcvbn from "zxcvbn";

import { RequestHandler } from "express";
import { _availableName } from "../nameavailable";
import { query } from "../../lib/sqlParser";
import { QS } from "../../dbqueries";
import { BV } from "../../middlewares/validateBody";

export default function signup(): RequestHandler {
    return async (req: BRequest<BodyTypes.singupInput>, res) => {
        try {
            const validInput = await validateInput(req.body);
            if (!validInput) {res.sendStatus(406); return;};

            const hashedPassword = await bcrypt.hash(req.body.password.toLowerCase(), 12);

            const [{ affectedRows }] = await db.query<OkPacket>(query(QS.createUser), [ req.body.username.toLowerCase(), 
                                                                   req.body.username, 
                                                                   hashedPassword, 
                                                                   req.body.email || null,
                                                                   new Date() ]);
            if (affectedRows === 1) {
                res.sendStatus(200);
            } else {
                res.sendStatus(500);
            }

        } catch (error) {
            winston.error(<Error>error);
            res.sendStatus(500);
            return;
        }
    }
}

export const signupShema = {
    username: BV.string,
    password: BV.string,
    rePassword: BV.string,
    email: BV.any
}

function checkUsername (name: string) {
    const reg = /[^0-9a-zA-Z._]/gi;
    const reg2 = /[a-zA-z]/gi;

    if (!name) return false;

    return !reg.test(name) && reg2.test(name);
}

async function validateInput(inputs: BodyTypes.singupInput) {
    if (!inputs) {
        return false;
    }

    if (!inputs.username ||
        !inputs.password ||
        !inputs.rePassword) {
        return false;
    }

    const passInfo = zxcvbn(inputs.password);

    if (passInfo.score < 3) {
        return false;
    }

    // check password length
    if (inputs.password.length < 8 || inputs.password.length > 100) {
        return false;
    }

    // check passwords matching
    if (inputs.password !== inputs.rePassword) {
        return false;
    }

    if (!checkUsername(inputs.username) || inputs.username.length > 30) {
        return false;
    }

    const existsName = await _availableName(inputs.username);

    if (existsName) {
        return false;
    }

    return true;
}