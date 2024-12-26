import { RequestHandler } from "express";
import { resError } from "../middlewares/errors";
import { bigNumToString } from "../lib/helpers";

import database from "../lib/database";
import qp from "../lib/sqlParser";
import winston from "../lib/logger";

type RawProfileData = {
    username: string
    name: string
    verified: Buffer
    picture: string
    github: Buffer
    bio: string
}

type ProfileData = { [key in keyof RawProfileData]: RawProfileData[key] extends Buffer? boolean: RawProfileData[key] } & {
    followers: number
    followings: number
};

export default function profileRoute (): RequestHandler {
    return async (req, res) => {
        const user = <LoggedUser>req.user;
        try {
            // retrieve all required data
            const profile = await getProfileData(user);

            res.render('profile', { url: req.url, profile, mine: true, bigNumToString });

        } catch (error) {
            winston.error(<Error>error);
            resError(res, req, 500);
        }
    }
}

export async function getProfileData (user: LoggedUser) {
    const [ raw ] = await database.query<RowDataPackets<RawProfileData>>(qp.query("getProfileMetadata"), [ user.username ]);
    const [ FollowData ] = await database.query<RowDataPackets< { count: number }>>(qp.query("GetFollowData"), [ user.username, user.username ]);
    const [ followers, followings ] = FollowData.map(e => e.count);

    if (!raw || raw.length == 0) {
        winston.error(new Error(`User (${user.username}@${user.id})'s Profile data not found!`));
        throw new Error("PDNF");
    }
    
    const profileInfo: ProfileData = {
        ...raw[0],
        verified: !!raw[0].verified.at(0),
        github: !!raw[0].github.at(0),
        followers: followers,
        followings: typeof followings === "number"? followings: followers,
    }

    return profileInfo;
}