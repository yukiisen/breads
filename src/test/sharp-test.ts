import { handleProfileUpload } from "../lib/mediaManager";
import winston from "../lib/logger";

winston.initialize("./logs/info.log","./logs/errors.log");

export async function main () {
    const res = await handleProfileUpload("fa4ci62f09fd1.webp", "mainimage");

    console.log(res);
}

main();
