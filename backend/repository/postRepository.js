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
            console.log(post.parent)
            const parent = await session.select().from('Post').where({'id': post.parent}).one();
            if (parent) {
                created = await session.create('VERTEX', 'Post').set(post).one();
                await session.create('EDGE', 'Replied').from(created['@rid']).to(parent['@rid']).one();
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

export async function findReplies(id) {
    const session = await pool.acquire();
    const result = await session.query('SELECT expand(in("Replied")) FROM Post WHERE id = :id', {params: {id: id}}).all();
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
         FROM (SELECT expand(out('Follows'))
               FROM User
               WHERE @rid = :userRid)
         ORDER BY datePosted DESC LIMIT :limit
SKIP :
         offset`,
        {
            params: {
                userRid: user['@rid'],
                limit: limit,
                offset: page * limit
            }
        }).all()
    await session.close();
    return result;
}

export async function findNewestFromRandomNonFollowedWithPagination(user, page, postLimit, amountOfUsers) {
    const session = await pool.acquire();
    // randomly select 5 non-followed users
    const notFollowedUsers = await session.query(`
                SELECT
                FROM User
                WHERE @rid NOT IN (SELECT in
                FROM Follows
                WHERE out = :userRid) AND @rid != :userRid`,
        {params: {userRid: user['@rid']}}).all();

    // randomly choose up to amountOfUsers non-followed users
    const randomNotFollowedUsers = notFollowedUsers.sort(() => Math.random() - 0.5).slice(0, amountOfUsers);
    const postsPerUser = Math.max(Math.floor(postLimit / amountOfUsers), 1);
    // select posts from non-followed users,
    const notFollowedPosts = await session.query(
        `SELECT expand(out('Posted'))
               FROM User
               WHERE @rid IN :randomNotFollowedUsers
         ORDER BY datePosted DESC LIMIT :postLimit
        SKIP :
         offset`,
        {
            params: {
                randomNotFollowedUsers: randomNotFollowedUsers.map(u => u['@rid']),
                postLimit: postLimit,
                offset: page * postLimit
            }
        }).all()
    // include user information in the result
    const result = notFollowedPosts.map(post => {
        post.author = notFollowedUsers.find(u => u['@rid'] === post.in);
        return post;
    });
    await session.close();
    return result;
}