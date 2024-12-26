import chalk, { Chalk, ColorSupport } from "chalk";
import moment from "moment";

import { createWriteStream, readFileSync, existsSync, writeFileSync } from "fs";
import EventEmitter from "events";

let Fconsole: Console;

type winstonEventMap = { "init": [] }
type ChalkInstance = Chalk & { supportsColor: ColorSupport };
namespace winston {
    export function isInitialized () {
        return !!Fconsole;
    }

    export const events = new EventEmitter<winstonEventMap>();

    export function initialize (stdout: string, stderr: string) {
        if (!existsSync(stderr)) writeFileSync(stderr, '');
        if (!existsSync(stdout)) writeFileSync(stdout, '');

        const o = readFileSync(stdout);
        const e = readFileSync(stderr);
        const out = createWriteStream(stdout, { encoding: "utf8" });
        const err = createWriteStream(stderr, { encoding: "utf8" });
        out.write(o);
        err.write(e);

        Fconsole = new console.Console(out, err);

        events.emit("init");
        info("Logger Tool is Running!");
    }

    export function info (message: unknown) {
        const time = `[${moment().format('HH:mm:ss')}]`;

        let msg = message;

        //if (typeof msg == "string") msg = chalk.blueBright(msg);
        console.info((time), msg);
        
        if (!["string", "number", "boolean"].includes(typeof message)) message = JSON.stringify(message);
        Fconsole.info(time, message);
    }

    export function log (message: unknown, chalkFunction: ChalkInstance = chalk.whiteBright) {
        const time = `[${moment().format('HH:mm:ss')}]`;

        let msg = message;

        if (typeof msg == "string") msg = chalkFunction(msg);
        console.log(chalkFunction(time), msg);
        
        if (!["string", "number", "boolean"].includes(typeof message)) message = JSON.stringify(message);
        Fconsole.log(time, message);
    }

    export function warn (message: unknown) {
        const time = `[${moment().format('HH:mm:ss')}]`;

        let msg = message;

        if (typeof msg == "string") msg = chalk.yellow(msg);
        console.warn(chalk.yellow(time), msg);

        if (!["string", "number", "boolean"].includes(typeof message)) message = JSON.stringify(message);
        Fconsole.warn(time, message);
    }

    export function error (error: Error) {
        const time = `[${moment().format('HH:mm:s')}]`;
        const out = (process.env.NODE_ENV === "development"? error.stack || error.message : error.message)
        console.error(chalk.red(time, out));
        Fconsole.error(time, error.stack);
    }
}

export default winston;