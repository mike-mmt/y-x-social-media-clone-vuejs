import express from "express";
import path from "node:path";
import bodyParser from "body-parser";
import cookie_parser from "cookie-parser";
import setupDatabaseConnection from "./setupDatabaseConnection.js";

const app = express();
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.json());

app.use(express.static(path.join("public")));

app.get('/', function (req,res) {
    res.sendFile(path + "index.html");
});

const orientConfig = {
    host: 'localhost',
    port: 2424,
    db: "tswproject",
    rootUser: "root",
    rootPassword: "rootpwd",
    user: "admin",
    password: "admin",
}

try {
    const { client, pool } = await setupDatabaseConnection(orientConfig);

    console.log(`Połączono z OrientDB: "${client.connected}"`);
    const apiPort = process.env.PORT || 3000;
    const apiHost = process.env.API_HOST || 'localhost';

    app.listen(apiPort, () => {
        console.log(`Serwer działa na http://${apiHost}:${apiPort}`);
    });

} catch (err) {
    console.error(`Błąd połączenia z OrientDB: `, err);
}

