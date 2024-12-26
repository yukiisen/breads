import { RequestHandler, static as static_ } from "express";
import { ServerResponse } from "http";

import Path = require("path");

interface ServeStaticOptions<R extends ServerResponse = ServerResponse> {
    acceptRanges?: boolean | undefined
    cacheControl?: boolean | undefined
    dotfiles?: string | undefined
    etag?: boolean | undefined
    extensions?: string[] | false | undefined
    fallthrough?: boolean | undefined
    immutable?: boolean | undefined
    index?: boolean | string | string[] | undefined
    lastModified?: boolean | undefined
    maxAge?: number | string | undefined
    redirect?: boolean | undefined
    setHeaders?: ((res: R, path: string, stat: any) => any) | undefined
}

interface EnchancedSSOptions extends ServeStaticOptions {
    /**
     * an Array of paths to exclude from the main path
     */
    excludePaths?: string[]

    /**
     * an Array of extentions to exclude from the file serving
     */
    excludeExtentions?: string[]
}

/**
 * 
 * @param path Path to the folder you want to serve files from, passed directly to ```express.static```
 * @param options Object with options for static file serving, same as the original function but adds the ```excludePaths``` and ```excludeExtentions``` properties
 * @returns a middleware that serves static files based on ```express.static``` and ```serve-static```
 * 
 * This is just an override for the built-in ```static``` function.
 */
export default function serveStatic (pathName: string, options: EnchancedSSOptions): RequestHandler {
    const serve = static_(pathName, options);
    return (req, res, next) => {
        for (const path of options.excludePaths || []) {
            if (req.path.startsWith("/" + (path[0] == "/"? path.replace(/\//i, ""): path))) return next();
        }

        for (const ext of options.excludeExtentions || []) {
            if (Path.basename(req.path).endsWith(ext)) return next();
        }

        serve(req, res, next);
    }
}

