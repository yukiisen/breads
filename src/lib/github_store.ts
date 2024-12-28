import appConfig from "../config.json";
import winston from "./logger";
import axios from "axios";
import db from "./database";
import fs from "fs";
import path from "path";
import { query } from "./sqlParser";

const config = appConfig as appConfig;
const { UPLOAD_CONFIG } = config.PROVIDERS.GitHub;

if (!winston.isInitialized()) {
    winston.initialize('./logs/info.log', './logs/errors.log');
}

interface GitHubUploadOptions {
    filename: string
    dir?: string,
    file: Buffer
}

if (config.STORAGE_PROVIDER !== 'GitHub') {
    winston.warn("Github isn't your main storage provider, please make sure you enable it!");
}

export async function uploadFile (options: GitHubUploadOptions) {
    try {
        const url = path.join(`https://api.github.com/repos/${UPLOAD_CONFIG.USERNAME}/${UPLOAD_CONFIG.REPOSITORY}/contents/`, `${path.join(options.dir || '', options.filename)}`);
        const body = {
            message: 'A new Upload!',
            content: options.file.toString("base64")
        }

        const res = await axios.put(url, JSON.stringify(body), {
            headers: {
                'Authorization': `token ${UPLOAD_CONFIG.TOKEN}`,
                'Content-Type': 'application/json'
            }
        });

        // FIXME: add rejection handling.
        winston.info(`File ${options.filename} was succesfully uploaded!`);

        return true;
    } catch (err) {
        winston.error(<Error>err);
        return false;
    }
}

export async function SendFilesToGitHub () {
    const [ profilePictures ] = await db.query(query('getUnuploadedProfiles'));
    const files: [ string, Buffer ][] = (<Array<{ picture: string }>>profilePictures)
                    .map(e => e.picture)
                    .filter(e => e !== 'mainimage')
                    .map(e => e += '.webp')
                    .map(e => [ e, fs.readFileSync(`./uploads/profiles/${e}`) ]);

    console.log(Object.fromEntries(files));

    await uploadFile({
        filename: files[0][0],
        file: files[0][1],
        dir: 'profiles/'
    });

    process.exit(0);
}