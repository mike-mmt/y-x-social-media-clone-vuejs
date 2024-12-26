import * as crypto from "node:crypto";

import { pool } from "./configRepos.js";

async function getAll() {
    const session = await pool.acquire();
    const result = await session.select().from("User").all();
    await session.close();
    return result;
}

async function getById(id) {
    const session = await pool.acquire();
    return await session.select().from("User").where({ "id": id }).one();
}

async function save(user) {
    const session = await pool.acquire();
    const existing = await session.select().from("User").where({ "username": user.username }).or({ "email": user.email }).one();
    if (existing) {
        throw new Error("User with this username or email already exists");
    }
    user["id"] = crypto.randomUUID();
    user["dateRegistered"] = new Date();
    return await session.create("VERTEX", "User").set(user).one();
}

async function deleteById(id) {
    const session = await pool.acquire();
    return await session.delete("VERTEX", "User").where({ "id": id }).one();
}

export { getAll, save, getById, deleteById}
