import db from "../lib/database";
import winston from "../lib/logger";
import parseGetBody from "../lib/getparser";

import { RequestHandler } from "express";
import { query } from "../lib/sqlParser";
import { QS } from "../dbqueries";

export default function availableName (): RequestHandler {
    return async (req, res) => {
        try {
            const { name } = parseGetBody(req);
            
            if (!name) {
                res.sendStatus(400);
                return;
            }

            const [isTaken] = await db.query<RowDataPacket[]>(query(QS.isNameAvailable), [ name ]);
            
            res.json({ exists: !!isTaken.length });
        } catch (error) {
            winston.error(<Error>error);
            res.sendStatus(500);
        }
    }
}

export async function _availableName (name: string) {
    try {
        const [hasName] = await db.query<RowDataPacket[]>(query(QS.isNameAvailable), [ name ]);
        return !!hasName.length;
    } catch (error) {
        winston.error(<Error>error);
    }
}