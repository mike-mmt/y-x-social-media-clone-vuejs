// noinspection SqlNoDataSourceInspection

import * as crypto from 'node:crypto';

import {pool} from './configRepos.js';

export async function findAll() {
    const session = await pool.acquire();
    const result = await session.select().from('Post').all();
    await session.close();
    return result;
}

export async function findById(id) {
    const session = await pool.acquire();
    return await session.select().from('Post').where({'id': id}).one();
}

export async function save(post, authorUser) {
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

export async function deleteById(id) {
    const session = await pool.acquire();
    return await session.delete('VERTEX', 'Post').where({'id': id}).one();
}

export async function getReplies(id) {
    const session = await pool.acquire();
    const result = await session.select().from('Post').where({'parent': id}).all();
    await session.close();
    return result;
}

export async function like(id, user) {
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

export async function unlike(id, user) {
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
export async function findWithPagination(page, limit) {
    const session = await pool.acquire();
    const result = await session.select().from('Post').limit(limit).skip(page * limit).all();
    await session.close();
    return result;
}

export async function findNewestFromFollowedWithPagination(user, page, limit) {
    const session = await pool.acquire();
    const result = await session.query(
        `SELECT expand(out('Posted'))
         FROM (
                  SELECT expand(out('Follows'))
                  FROM User
                  WHERE @rid = :userRid
              )
         ORDER BY datePosted DESC
             LIMIT :limit
SKIP :offset`,
        { params: {
            userRid: user['@rid'],
            limit: limit,
            offset: page * limit
            }}).all()
    await session.close();
    return result;
}

export async function findNewestFromRandomNonFollowedWithPagination(user, page, limit) {
    const session = await pool.acquire();
    // select non-followed users
    const notFollowedUsers = await session.query(
     `SELECT FROM User WHERE @rid NOT IN (SELECT in FROM Follows WHERE out = :userRid) AND @rid != :userRid`, {params: {userRid: user['@rid']}}).all();
    // select posts from non-followed users
    const notFollowedPosts = await session.query(
        `SELECT expand(out('Posted')) FROM (
            SELECT expand(out('Posted'))
            FROM User
            WHERE @rid IN :notFollowedUsers
            ) 
        ORDER BY datePosted DESC 
        LIMIT :limit
        SKIP :offset`,
        { params: {
            notFollowedUsers: notFollowedUsers.map(u => u['@rid']),
            limit: limit,
            offset: page * limit
        }}).all()
    await session.close();
    return notFollowedUsers
}