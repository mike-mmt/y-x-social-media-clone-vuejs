import express from "express";
import path from "node:path";
import bodyParser from "body-parser";
import dotenv from 'dotenv';

dotenv.config();
// import cookie_parser from "cookie-parser";
import setupDatabaseConnection from "./setupDatabaseConnection.js";

const app = express();

app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
})

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.json());

app.use(express.static(path.join("public")));

// passport
app.use(passport.initialize());
// import passportConfig from './passport-config.js'
import "./passport-config.js";
// passportConfig(passport);

// routes
app.get('/', function (req,res) {
    res.sendFile(path + "index.html");
});

import users from "./routes/users.js";
app.use('/api/users', users);
import posts from "./routes/posts.js";
app.use('/api/posts', posts);
import auth from './routes/auth.js';
app.use('/api/auth', auth);

// db config
const orientConfig = {
    host: 'localhost',
    port: 2424,
    db: "tswproject",
    rootUser: "root",
    rootPassword: "rootpwd",
    user: "admin",
    password: "admin",
}

import {config as configRepos} from "./repository/configRepos.js";


// authorization
import passport from 'passport';
import {initDatabase} from './repository/init.js';

try {
    // setup db
    const { client, pool } = await setupDatabaseConnection(orientConfig);

    // config user repository
    configRepos(client, pool);

    await initDatabase() // ONLY RUN ONCE


    console.log(`Połączono z OrientDB: "${client.connected}"`);
    const apiPort = process.env.PORT || 3000;
    const apiHost = process.env.API_HOST || 'localhost';

    const server = app.listen(apiPort, () => {
        console.log(`Serwer działa na http://${apiHost}:${apiPort}`);
    });
    server.setTimeout(1000 * 10); // 10 seconds

} catch (err) {
    console.error(`Błąd połączenia z OrientDB: `, err);
}

