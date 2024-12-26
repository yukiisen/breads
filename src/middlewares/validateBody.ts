import { Request, RequestHandler, Response } from "express";
import winston from "../lib/logger";

type errFun = (req: Request, res: Response) => void

export default function validateBody (structure: bodyStructure, error?: errFun): RequestHandler {
    return async (req, res, next) => {
        if (!req.body) {
            if (error) {
                error(req, res);
                return;
            }
            res.sendStatus(400);
            return;
        }

        const { body } = req;

        if (checkObject(body, structure, true)) {
            next();
        } else {
            if (error) {
                error(req, res);
                return;
            }
            res.sendStatus(400);
            return;
        }
    }
}

export namespace BV {
    export const string = "string";
    export const number = "number";
    export const obj = "object";
    export const boolean = "boolean";
    export const func = "function";
    export const symbol = "symbol";
    export const bigint = "bigint";
    export const any = "any";
}

export function checkObject (body: variant, structure: bodyStructure, debug: boolean = false) {
    for (const key in structure) {
        if (body[key] !== undefined || body[key] !== null) {

            if (typeof structure[key] !== "string")
                { if (!checkObject(body[key], <bodyStructure>structure[key], debug)) return false; }
                
            else if (structure[key] === "any") continue;
            else if (typeof body[key] !== structure[key]) {
                debug? winston.log(`type ${typeof body[key]} doesn't match type ${structure[key]}!`): null;
                return false;
            }

        } else {
            debug? (() => { winston.log(`property ${key} doesn't exist in `); winston.log(body) })(): null;
            return false;
        }
    }

    return true;
}