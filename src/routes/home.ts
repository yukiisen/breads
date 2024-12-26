import { RequestHandler } from "express";

export default function homeRoute(): RequestHandler {
    return (req, res, next) => {
        if (!['/', '/home'].includes(req.url)) {
            return next();
        }

        res.render('home', { url: req.url });
    }
}