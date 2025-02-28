import { RequestHandler } from "express";
import { BV } from "../../middlewares/validateBody";

import crypto from "crypto";
import fs from "fs/promises";

import database from "../../lib/database";
import qp from "../../lib/sqlParser";
import winston from "../../lib/logger";
import config from "../../config.json";

import { handleProfileUpload } from "../../lib/mediaManager";
import { _availableName } from "../nameavailable";
import { uploadFile } from "../../lib/github_store";

type mail = string
type base64 = string
interface ProfileEditShema {
    username: string
    name: string
    picture: base64
    bio: string | null
    email: mail,
    github?: boolean
}

// TODO: implement the github storage provider ASAP.
// Done but I probably need to upload the min and mid images too.
export default function EditProfile (): RequestHandler {
    return async (req, res) => {
        try {
            const user = req.user as LoggedUser;
            const body = req.body as ProfileEditShema;
            // this is used to remove the old image from the database, otherwise it's submitted again to it.
            const [ oldData ] = await database.query<RowDataPackets<{ picture: string, github: Buffer }>>(qp.query("GetProfilePicture"), [ user.id ]);

            if (body.username && body.username !== user.username) {
                const taken = await _availableName(body.username);
                if (taken) {
                    res.sendStatus(406);
                    return;
                }
            }

            if (body.email && !/(\w)@(\w).(\w)/i.test(body.email)) {
                res.sendStatus(406);
                return;
            }

            if (body.picture) {
                const imageHandle = await handleProfilePicture(req.body.picture);
                if (imageHandle == false) { 
                    res.sendStatus(415);
                    return;
                }

                body.picture = imageHandle.name;
            }
            
            const [ result ] = await database.query<OkPacket>(qp.query("EditProfile"), [ 
                body.username || user.username, 
                body.name || null, 
                body.bio || null, 
                body.email || null,
                body.picture || oldData[0].picture,
                body.github || !!oldData[0].github.at(0),
                user.id
            ]);

            if (result.changedRows == 1) {
                res.sendStatus(200);
                // removes the old profile picture from the storage.
                if (config.UPLOADS.removeUnusedPFPs && body.picture) removeOldProfile(oldData[0].picture);
            } else {
                res.sendStatus(500);
            }
        } catch (error) {
            winston.error(<Error>error);
            res.sendStatus(500);
        }
    }
}

export const editProfileShema = {
    username: BV.string,
    name: BV.string,
    bio: BV.string,
    email: BV.string,
    picture: BV.string,
}

function generateRandomName () {
    const buff = Buffer.concat([
        crypto.randomBytes(17),
        Buffer.from([(new Date).getTime()])
    ]);

    return buff.toString("hex");
}

async function handleProfilePicture (data: string) {
    const type = data.match(/data:image\/(\w+);base64/i);
    // TODO: fix this somehow
    // sorry, I mean this should send a 400 or 403 status code instead of 500.
    if (!type) return false;

    const name = generateRandomName();
    const buff = Buffer.from(data.split(',')[1], "base64");

    const result = await handleProfileUpload(buff, name);
    
    if (!result.accepted) {
        winston.error(new Error("Couldn't process image because " + result.reason));
        return false;
    }

    if (config.STORAGE_PROVIDER == "github" && config.PROVIDERS.GitHub.UPLOAD_FILES) {
        const uploadsuccess = await uploadFile({
            file: buff,
            filename: name.concat(".webp"),
            dir: 'profiles'
        });

        return { name, external: uploadsuccess };
    } else {
        return { name, external: false };
    }
}

async function removeOldProfile(name: string) {
    if (name == "mainimage") return;
    const paths = ['original', 'min', 'mid'].map(e => `./uploads/profiles/${e}/${name}.webp`);
    
    paths.forEach(path => {
        fs.unlink(path).catch(e => winston.error(e));
    });
}