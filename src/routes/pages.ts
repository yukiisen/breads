import { RequestHandler } from "express";
import path from 'path';

export default function servePage (page: string): RequestHandler {
    return (req, res) => {
        res.render(page);
        //res.sendFile(path.join(__dirname, '../../pages', page));
    }
}