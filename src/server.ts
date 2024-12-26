import "source-map-support/register";
import "./usage";

import config from "./config.json";

import https from "https";
import fs from "fs";
import express from "express";
import chalk from "chalk";
import socketIO from "socket.io";
import passport from "passport";
import RedisStore from "connect-redis";

import { createClient } from "redis";

import winston from "./lib/logger";
import QP from "./lib/sqlParser";
import OnlineUser from "./lib/Auth/User";

import session from "express-session";
import compression from "compression";

// middlewares
import errorsHandler from "./middlewares/errors";
import browserCheck from "./middlewares/browserCheck";
import validateBody from "./middlewares/validateBody";
import reqLogger from "./middlewares/requestLogger";
import serveStatic from "./middlewares/serveStatic";

// other routes
import homeRoute from "./routes/home";
import profileRoute from "./routes/profile";

// login routes
import signup, { signupShema } from "./API/routes/signup";
import login, { loginShema } from "./API/routes/login";
import availableName from "./API/nameavailable";
import LocalStrategyInstance, { deserializeUser, isAuthenticated } from "./lib/Auth/strategy";

// File serving routes.
import serveMedia from "./routes/serveImages";
import serveProfilePictures from "./routes/serveProfiles";
import servePage from "./routes/pages";

// API Endpoints:
// Posts API Endpoint.
import postGetter from "./API/posts/getter";

import ProfileAPIRoute from "./API/routes/profile";
import ParseJSON from "./lib/JSONParser";
import EditProfile, { editProfileShema } from "./API/routes/profileEdit";

const { env } = process;

const DAYINMELLISECONDS = 1000 * 60 * 60 * 24;

const serverOptions = {
    key: fs.readFileSync('./certs/localhost-key.pem'),
    cert: fs.readFileSync('./certs/localhost-cert.pem')
}

// Initialize the redis client for session management
// !should be re-configured with the username and password instead.
const RedisClient = createClient({ password: env.REDISPASS });
RedisClient.connect();
RedisClient.ping("Test").then(e => {
    if (winston.isInitialized()) { winston.info("Redis Client Connected!"); }
    else {
        winston.events.on("init", () => {
            winston.info("Redis Client Connected!");
        })
    }
});

// Session Configuration
// Done separately for compatibility with socket.io

// TO-DO:
// generate a random session key
// append It to the list of previous keys instead of using one static key
// - done but needs some more work.
const sessionKey = config.SESSIONSECRETS[0];

const sessionConfig: session.SessionOptions = {
    store: new RedisStore({ client: RedisClient, prefix: "breads:" }),
    saveUninitialized: true,
    resave: false,
    name: '5biza',
    secret: sessionKey,
    cookie: {
        httpOnly: true,
        maxAge: DAYINMELLISECONDS,
        secure: true
    },
}

// Passport initialize
passport.use('localAuth', LocalStrategyInstance);
passport.serializeUser((user, done) => done(null, (<{id: number}>user).id));
passport.deserializeUser(deserializeUser);

winston.initialize('./logs/info.log', './logs/errors.log');

// Read SQL files
QP.addFile("./SQL/login.sql");
QP.addFile("./SQL/GitHub_Uploader.sql");
QP.addFile("./SQL/profile.sql");
QP.addFile("./SQL/posts.sql");

// Server Port and Hostname
const httpsPort = env.PORT || 443,
      httpPort = env.PORT2 || 80,
      host = process.argv[3] || '127.0.0.1';

// Online Users will be saved here
const Online: OnlineUser[] = [];

// Server Setup
const app = express();

// Config
app.set('views', './templates');
app.set('view engine', 'jade');

// compress the response if It passes the 10kb size
app.use(compression({
    level: 9,
    threshold: 1024 * 10
}));

// initialize session manager
app.use(session(sessionConfig));

// serve static files from the "public" directory
// Has been overriden to implement exclude functionality
const serveStaticOptions = {
    extensions: ["js"],
    excludeExtentions: app.get("env") == "development"? []: ["json", "d.ts"],
    excludePaths: app.get("env") == "development"? []: ["src", "sass"],
}

app.use(serveStatic('./public', serveStaticOptions));

// parse request bodies
app.use(express.urlencoded({ extended: true, limit: "8kb" }));
app.use(ParseJSON({
    '/API/signup': [["POST", "3kb"]],
    '/API/login': [["POST", "3kb"]],
    '/API/profile': [["PATCH", config.UPLOADS.profilePictureLimit]]
}));

// initialize passport for login sessions
app.use(passport.initialize());
app.use(passport.session({ pauseStream: true }));

// log other requests
app.use(reqLogger());

// TODO: Move this to top.
// check and remove outdated browsers
app.use(browserCheck());

// !important
// Any "use", "post" or "get" function below is a separate route from now on.

// Website routes

// Normal Routes
app.get("/login", servePage('login'));
app.get("/signup", servePage('signup'));

// API Routes
app.post("/API/signup", validateBody(signupShema), signup());
app.post("/API/login", validateBody(loginShema), login());
app.use("/API/authed", (req, res) => { res.json({ Authenticated: req.isAuthenticated() }) });
app.use("/API/logout", isAuthenticated, (req, res) => req.logout((err) => { if (err) { winston.error(<Error>err); res.sendStatus(500); } else res.sendStatus(200); }));

app.get("/API/posts", postGetter());
app.get("/API/nameavailable", availableName());

app.get("/API/profile", isAuthenticated, ProfileAPIRoute());
app.patch("/API/profile", isAuthenticated, validateBody(editProfileShema), EditProfile());

// Protected Routes (Require Authentication)
app.get(['/home', '/'], isAuthenticated, homeRoute());
app.get('/profile', isAuthenticated, profileRoute());

app.get("/media/uploads/:type/:id/", serveMedia());
app.get("/media/profiles/:size/:id/", serveProfilePictures());

app.use(errorsHandler.notFound());

// Wrap the application into an HTTPS server
// The Typeerror is happening due to the outdated VSCode, consider upgrading.
const server = https.createServer(serverOptions, app);

server.listen(+httpsPort, host, () => {
    winston.info(`The server is listening at https://${host}:${httpsPort}`);
});

// Create an HTTP server to redirect missing requests
const httpapp = express()
                .use((req, res) => res.redirect(`https://${req.hostname}:${httpsPort}${req.url}`))
                .listen(+httpPort, host, () => {
                    winston.info(`The redirect server is listening at http://${host}:${httpPort}`);
                })

//io.listen(server);

// catch any unrecognized error and shut the server down instead of letting the process kill itself.
process.on("uncaughtException", (err) => {
    winston.error(err);
    httpapp.close();
    server.close(() => {
        winston.log("Server Closing Due to an internal error.", chalk.red);
        process.exit(1);
    });
});