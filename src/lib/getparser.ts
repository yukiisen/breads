import QueryString from "querystring";
import { Request } from "express";

export default function parseGetBody <T extends variant>(req: Request): T {
    return <T>JSON.parse(JSON.stringify(QueryString.parse(req.url.slice(req.url.indexOf("?") + 1))));
}