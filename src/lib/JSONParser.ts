import { RequestHandler, json } from "express";

export type ParseJSONConfig = {
    [key: string]: ["POST" | "PUT" | "DELETE" | "PATCH", string][]
}

type ParseJSONfunc = {
    [key: string]: ["POST" | "PUT" | "DELETE" | "PATCH", RequestHandler][]
}

export default function ParseJSON(config: ParseJSONConfig): RequestHandler {
    const funcs: ParseJSONfunc = {};

    for (const key in config) {
        funcs[key.toLowerCase() as keyof ParseJSONfunc] = config[key].map(([method, limit]) => [method, json({ limit })]);
    }

    return (req, res, next) => {
        if (!(req.path.toLowerCase() in funcs)) return next();

        const route = funcs[req.path.toLowerCase()].find(e => req.method.toUpperCase() === e[0])
        if (!route) return next();

        route[1](req, res, next);
    }
}