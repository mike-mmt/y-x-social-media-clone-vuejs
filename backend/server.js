import express from "express";
import path from "node:path";
import bodyParser from "body-parser";
import dotenv from 'dotenv';
import cors from 'cors';

dotenv.config();
// import cookie_parser from "cookie-parser";
import setupDatabaseConnection from "./setupDatabaseConnection.js";

const app = express();

// simple request logging
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
})

app.use(cors())
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.json());

// app.use(express.static(path.join("public")));

// passport
app.use(passport.initialize());
import "./passport-config.js";

// routes

import users from "./routes/users.js";
app.use('/api/users', users);
import posts from "./routes/posts.js";
app.use('/api/posts', posts);
import auth from './routes/auth.js';
app.use('/api/auth', auth);

// db config
const orientConfig = {
    host: process.env.ORIENTDB_HOST || 'localhost',
    port: parseInt(process.env.ORIENTDB_PORT) || 2424,
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
    let client, pool;
    let maxRetries = 5, delay = 5000
    for (let i = 0; i < maxRetries; i++) {
        try {
            console.log(`Attempting to connect to OrientDB (attempt ${i + 1}/${maxRetries})...`);
            const conn = await setupDatabaseConnection(orientConfig);
            client = conn.client;
            pool = conn.pool;
            break;
        } catch (error) {
            console.error(`Failed to connect (attempt ${i + 1}/${maxRetries}):`, error);
            if (i < maxRetries - 1) {
                console.log(`Waiting ${delay / 1000} seconds before next attempt...`);
                await new Promise(resolve => setTimeout(resolve, delay));
            } else {
                throw new Error('Failed to connect to OrientDB after multiple attempts');
            }
        }
    }

    // config user repository
    configRepos(client, pool);

    await initDatabase()

    console.log(`Połączono z OrientDB: "${client.connected}"`);
    const apiPort = process.env.PORT || 3000;
    const apiHost = process.env.API_HOST || 'localhost';

    const server = app.listen(apiPort, () => {
        console.log(`Serwer działa na https://${apiHost}:${apiPort}`);
    });
    server.setTimeout(1000 * 10); // 10 seconds

} catch (err) {
    console.error(`Błąd połączenia z OrientDB: `, err);
}

