// noinspection SqlNoDataSourceInspection

import * as crypto from 'node:crypto';

import {pool} from './configRepos.js';

const POST_PROJECTION = `*, first(in('Posted')).username AS authorUsername,
 first(in('Posted')).displayName AS authorDisplayName,
  in('Likes').size() AS likesCount,
   in('Replied').size() AS repliesCount,
   first((SELECT COUNT(*) AS isMuted FROM (SELECT expand(in('Muted')) FROM (SELECT expand(in('Posted')) FROM $current)) WHERE @rid = :userRid)).isMuted AS isMuted,
    first((SELECT COUNT(*) AS hasLiked FROM (SELECT expand(in('Likes')) FROM $current) WHERE @rid = :userRid)).hasLiked AS hasLiked`;

export async function findAll() {
    const session = await pool.acquire();
    const result = await session.query(`SELECT *, first(in('Posted')).username AS authorUsername, first(in('Posted')).displayName AS authorDisplayName FROM Post`).all();
    await session.close();
    return result;
}

export async function findById(id, user) {
    const session = await pool.acquire();
    const result = await session.query(`SELECT ${POST_PROJECTION} FROM Post WHERE id = :id`, {params: {id: id, userRid: user['@rid']}}).one();
    await session.close();
    return result;
}

export async function save(post, authorUser) {
    post['id'] = crypto.randomUUID();
    post['datePosted'] = new Date();
    const session = await pool.acquire();
    // session.begin();
    let created;
    try {
        if ('parent' in post) { // reply to a post
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
        // console.log(`creating edge from ${authorUser['@rid']} to ${created['@rid']}`);
        await session.create('EDGE', 'Posted').from(authorUser['@rid']).to(created['@rid']).one();
        // session.commit();
    } catch (error) {
        // await session.rollback();
        console.error(error)
        throw error;
    } finally {
        await session.close();
    }
    created['authorUsername'] = authorUser.username;
    created['authorDisplayName'] = authorUser.displayName;
    created['likesCount'] = 0;
    created['repliesCount'] = 0;
    created['hasLiked'] = 0;
    return created;
}

export async function deleteById(id) {
    const session = await pool.acquire();
    const result = await session.delete('VERTEX', 'Post').where({'id': id}).one();
    await session.close();
    return result;
}

export async function findReplies(id, user) {
    const session = await pool.acquire();
    const result = await session.query(`SELECT ${POST_PROJECTION} FROM (SELECT expand(in("Replied")) FROM Post WHERE id = :id) WHERE :userRid NOT IN first(in('Posted')).in('Blocked') ORDER BY datePosted DESC`, {params: {id: id, userRid: user['@rid']}}).all();
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
//     const result = await session.query(
//         `SELECT *, $author.username AS authorUsername, $author.displayName AS authorDisplayName FROM (SELECT expand(out('Posted'))
//          FROM (SELECT expand(out('Follows'))
//                FROM User
//                WHERE @rid = :userRid) ORDER BY datePosted DESC LIMIT :limit
// SKIP :
//          offset) LET $author = first(in('Posted'))`,
//         {
//             params: {
//                 userRid: user['@rid'],
//                 limit: limit,
//                 offset: page * limit
//             }
//         }).all()
    const result = await session.query(
        `SELECT ${POST_PROJECTION} FROM (SELECT expand(out('Posted'))
               FROM User
                WHERE :userRid IN in('Follows') AND :userRid NOT IN in('Muted') AND :userRid NOT IN both('Blocked') ORDER BY datePosted DESC) WHERE out('Replied').size() = 0 LIMIT :limit SKIP :offset`,
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
        SELECT FROM User 
        WHERE @rid NOT IN (SELECT in FROM Follows WHERE out = :userRid)
        AND @rid != :userRid
        AND :userRid NOT IN in('Muted')
        AND :userRid NOT IN both('Blocked')`,
        {params: {userRid: user['@rid']}}).all();
    // randomly choose up to amountOfUsers non-followed users
    const randomNotFollowedUsers = notFollowedUsers.sort(() => Math.random() - 0.5).slice(0, amountOfUsers);
    const postsPerUser = Math.max(Math.floor(postLimit / amountOfUsers), 1);
    // select posts from non-followed users
    const notFollowedPosts = await session.query(
        `SELECT ${POST_PROJECTION} FROM (
SELECT expand(out('Posted'))
               FROM User
               WHERE @rid IN :randomNotFollowedUsers
         ORDER BY datePosted DESC) WHERE out('Replied').size() = 0 LIMIT :postLimit
        SKIP :offset`,
        {
            params: {
                randomNotFollowedUsers: randomNotFollowedUsers.map(u => u['@rid']),
                postLimit: postLimit,
                offset: page * postLimit
            }
        }).all()
    await session.close();
    return notFollowedPosts;
}

export async function findMyPosts(user, page, limit) {
    const session = await pool.acquire();
    const result = await session.query(
        `SELECT ${POST_PROJECTION}
         FROM (SELECT expand(out ('Posted'))
             FROM User
             WHERE @rid = :userRid ORDER BY datePosted DESC LIMIT :limit SKIP : offset)`,
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

export async function findUserPosts(username, user, page, limit) {
    const session = await pool.acquire();
    const result = await session.query(
        `SELECT ${POST_PROJECTION}
         FROM (SELECT expand(out ('Posted'))
             FROM User
             WHERE username = :username ORDER BY datePosted DESC LIMIT :limit SKIP : offset)`,
        {
            params: {
                username: username,
                userRid: user['@rid'],
                limit: limit,
                offset: page * limit
            }
        }).all()
    await session.close();
    return result;
}