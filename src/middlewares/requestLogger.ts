import { RequestHandler } from "express";

import chalk from "chalk";
import winston from "../lib/logger";
import conf from "../config.json";

const config = <appConfig>conf;

export default function reqLogger (): RequestHandler {
    return async (req, res, next) => {

        //console.log(req.user);
        
        for (const route of config.LOGGER.EXCLUDEDROUTES) {
            if (req.path.toLowerCase().startsWith(route.toLowerCase())) return next();
        }

        const ima = (new Date()).getMilliseconds();

        res.once("finish", () => {
            const timediff = (new Date()).getMilliseconds() - ima;
            const logFunction = res.statusCode < 400? chalk.blue: chalk.redBright;
            
            winston.log(
                `${req.ip}${req.user? " " + (<{username: string}>req.user).username: ''} ${req.hostname}${req.url} ${req.method} HTTPS/${req.httpVersion} ${res.statusCode}:${res.statusMessage} ${timediff}ms`,
                logFunction
            );
        });

        next();
    }
}