import { RequestHandler } from "express";
import { getProfileData } from "../../routes/profile";

import database from "../../lib/database";
import qp from "../../lib/sqlParser";
import winston from "../../lib/logger";

export default function ProfileAPIRoute(): RequestHandler {
    return async (req, res) => {
        try {
            const user = req.user as LoggedUser
            const [ data, err ] = await getProfileData(user);
            if (err) {
                res.sendStatus(404);
                return;
            }

            const resBody = {
                username: data.username,
                name: data.name,
                bio: data.bio,
                picture: data.picture,
                email: (await database.query<RowDataPackets<{ email: string }>>(qp.query("GetUserEmail"), [ user.id ]))[0][0]?.email,
                verified: data.verified,
                github: data.github
            }

            res.json(resBody);
        } catch (error) {
            winston.error(<Error>error);
            res.sendStatus(500);
        }
    }
}