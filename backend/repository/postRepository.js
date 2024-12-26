import * as crypto from "node:crypto";

import { pool } from "./configRepos.js";

async function getAll() {
    const session = await pool.acquire();
    const result = await session.select().from("Post").all();
    await session.close();
    return result;
}

async function getById(id) {
    const session = await pool.acquire();
    return await session.select().from("Post").where({ "id": id }).one();
}

async function save(post) {
    const session = await pool.acquire();
    post["id"] = crypto.randomUUID();
    post["datePosted"] = new Date();
    return await session.create("VERTEX", "Post").set(post).one();
}

async function deleteById(id) {
    const session = await pool.acquire();
    return await session.delete("VERTEX", "Post").where({ "id": id }).one();
}

export { getAll, save, getById, deleteById }
