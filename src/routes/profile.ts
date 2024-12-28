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

export function UserProfileRoute (): RequestHandler {
    return async (req, res) => {
        const user = <LoggedUser>req.user;
        try {
            // retrieve all required data
            const [ profile, err ] = await getProfileData(user);
            if (err) return resError(res, req, 404);

            res.render('profile', { url: req.url, profile, mine: true, bigNumToString });

        } catch (error) {
            winston.error(<Error>error);
            resError(res, req, 500);
        }
    }
}

export function OtherProfileRoute (): RequestHandler {
    return async (req, res) => {
        const user = <LoggedUser>req.user;
        const { username } = req.params;
        try {
            // check if the user is blocked
            const [ blocked ] = await database.query<RowDataPackets>(qp.query('isBlocked'), [ username, user.id ]);
            if (blocked.length !== 0) return resError(res, req, 403);

            // retrieve all required data
            const [ profile, err ] = await getProfileData({ username, id: -1 });
            if (err) return resError(res, req, 404);

            res.render('profile', { url: req.url, profile, mine: false, bigNumToString });

        } catch (error) {
            winston.error(<Error>error);
            resError(res, req, 500);
        }
    }
}

export async function getProfileData (user: LoggedUser): Promise<[ ProfileData, null ] | [ null, Error & { code: string } ]> {
    const [ raw ] = await database.query<RowDataPackets<RawProfileData>>(qp.query("getProfileMetadata"), [ user.username ]);
    const [ FollowData ] = await database.query<RowDataPackets< { count: number }>>(qp.query("GetFollowData"), [ user.username, user.username ]);
    const [ followers, followings ] = FollowData.map(e => e.count);

    if (!raw || raw.length == 0) {
        // Check which function is calling this one and act based on that.
        // this prevents unneccesary errors when the usr requests a non existed profile.
        if (user.id !== -1) winston.error(new Error(`User (${user.username}@${user.id})'s Profile data not found!`));
        const err = new Error("Profile Data not Found") as Error & { code: string };
              err.code = "PDNF";
        return [ null, err ];
    }
    
    const profileInfo: ProfileData = {
        ...raw[0],
        verified: !!raw[0].verified.at(0),
        github: !!raw[0].github.at(0),
        followers: followers,
        followings: typeof followings === "number"? followings: followers,
    }

    return [ profileInfo, null ];
}