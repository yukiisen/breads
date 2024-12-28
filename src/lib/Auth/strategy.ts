import db from "../database";
import bcrypt from "bcrypt"

import { Strategy, VerifyFunction } from "passport-local";
import { QS } from "../../dbqueries";
import { query } from "../sqlParser";
import { RequestHandler } from "express";


const Verify: VerifyFunction = async function (username, password, done) {
    try {
        const [User] = await db.query<RowDataPackets<{ password: string, id: number }>>(query(QS.existsUser), [ username ]);

        if (!User.length) {
            return done(null, false);
        }

        const compared = await bcrypt.compare(password, User[0].password);

        if (!compared) {
            return done(null, false);
        }
        
        let { id } = User[0];

        done(null, { username, password, id });
    } catch (error) {
        done(error);
    }
}

export default new Strategy(Verify);

export async function deserializeUser (id: number, done: (err: any, user?: false | Express.User | null | undefined) => void) {
    type deserializeOutput = RowDataPackets<{ id: number, username: string }>

    try {
        const [ user ] = await db.query<deserializeOutput>(query(QS.deserializeUser), [ id ]);
        if (!user || user.length == 0) done(null, false);
        else done(null, user[0]);
    } catch (error) {
        done(error, undefined);
    }
}

export const isAuthenticated: RequestHandler = function (req, res, next) {
    if (req.isAuthenticated()) next();
    else res.redirect('/login');
}

export interface User extends Express.User {
    id: number
    username: string
    password: string
}