import * as crypto from 'node:crypto';

import {pool} from './configRepos.js';

async function getAll() {
    const session = await pool.acquire();
    const result = await session.select().from('Post').all();
    await session.close();
    return result;
}

async function getById(id) {
    const session = await pool.acquire();
    return await session.select().from('Post').where({'id': id}).one();
}

async function save(post, authorUser) {
    post['id'] = crypto.randomUUID();
    post['datePosted'] = new Date();
    const session = await pool.acquire();
    session.begin();
    let created;
    try {
        if ('parent' in post) { // reply to a post
            if (await session.select().from('Post').where({'@rid': post.parent}).one()) {
                created = await session.create('VERTEX', 'Post').set(post).one();
                await session.create('EDGE', 'Reply').from(post.parent).to(created['@rid']).one();
            } else {
                throw new Error('Parent post does not exist');
            }
        } else { // new post
            created = await session.create('VERTEX', 'Post').set(post).one();
        }
        await session.create('EDGE', 'Posted').from(authorUser['@rid']).to(created['@rid']).one();
        session.commit();
    } catch (error) {
        // await session.rollback();
        console.error(error)
        throw error;
    } finally {
        await session.close();
    }
    return created;
}

async function deleteById(id) {
    const session = await pool.acquire();
    return await session.delete('VERTEX', 'Post').where({'id': id}).one();
}

async function getReplies(id) {
    const session = await pool.acquire();
    const result = await session.select().from('Post').where({'parent': id}).all();
    await session.close();
    return result;
}

async function like(id, user) {
    const session = await pool.acquire();
    const post = await session.select().from('Post').where({'id': id}).one()
    if (!post) {
        throw new Error('Post does not exist');
    }
    const existing = await session.select().from('Likes').where({
        'out': user['@rid'],
        'in': post['@rid']
    }).one();
    if (existing) {
        throw new Error('Already liked this post');
    }
    const created = await session.create('EDGE', 'Likes').from(user['@rid']).to(post['@rid']).one();
    await session.close()
    return created;
}

async function unlike(id, user) {
    const session = await pool.acquire();
    const post = await session.select().from('Post').where({'id': id}).one()
    const result = await session.delete('EDGE', 'Likes').where({
        'out': user['@rid'],
        'in': post['@rid']
    }).one();
    if (result['count'] === 0) {
        throw new Error('Does not like this post already');
    }
    await session.close();
}

export {getAll, save, getById, deleteById, like, unlike, getReplies}
