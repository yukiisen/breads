import { RequestHandler } from "express";

import parseGetBody from "../../lib/getparser";
import database from "../../lib/database";
import qp from "../../lib/sqlParser";
import winston from "../../lib/logger";

interface PostGetterAPICall {
    method: "user" | "id",
    id?: number,
    username?: string
}

export default function postGetter (): RequestHandler {
    return async (req, res) => {
        const user = req.user as LoggedUser;
        try {
            // FIXME: add body validation.
            const body = parseGetBody<PostGetterAPICall>(req);
            const posts = await getUserPosts(body.username!, user);
            res.status(200).json(posts);
        } catch (error) {
            winston.error(<Error>error);
            res.sendStatus(500);
        }
    }
}

/** @throws an error when one of the queries fails. make sure to add proper error handling */
async function getUserPosts (username: string, { id, username: name }: LoggedUser = { id: -1, username: "", password: "" }) {
    const [ RawPosts ] = await database.query<RowDataPackets<RawPost>>(qp.query("getUserPosts"), [username, id, id]);
    if (RawPosts.length == 0) return [];
    const ids = RawPosts.map(e => e.id);
    const [ likes ] = await database.query<RowDataPackets<{ postID: number }>>(qp.query("GetMyReactions"), [ id, ids ]);
    const [ saves ] = await database.query<RowDataPackets<{ postID: number }>>(qp.query("GetMySaves"), [ id, ids ]);
    // TODO: search whether it's better to check whether images exist or fetch the empty lists anyway.
    const mediaIDs = RawPosts.filter(e => !!e.has_media.at(0)).map(e => e.id);
    const [ media ] = mediaIDs.length == 0? [[]] : await database.query<RowDataPackets<BoolToBuff<ImageData>>>(qp.query("GetPostsImages"), [ mediaIDs ]);
    const Posts: PostAPIResponse[] = [];

    for (let i = 0; i < RawPosts.length; i++) {
        Posts.push({
            ...RawPosts[i],
            saved: saves.findIndex(e => e.postID == RawPosts[i].id) > -1? true: false,
            liked: likes.findIndex(e => e.postID == RawPosts[i].id) > -1? true: false,
            has_media: !!RawPosts[i].has_media.at(0),
            verified: !!RawPosts[i].verified,
            images: media.filter(e => e.postID == RawPosts[i].id).map(e => ({ ...e, github: !!e.github.at(0) })),
            mine: username === name
        });
    }

    return Posts;
}