import { Request, RequestHandler, Response } from "express";

export function resError (res: Response, req: Request, code: number, message?: string) {
    res.status(code).render('error', { url: req.url, code });
}

export function notFound (): RequestHandler {
    return (req, res) => {
        return resError(res, req , 404, "Page not found!");
    }
}

const _module = {
    resError,
    notFound
}

export default _module;