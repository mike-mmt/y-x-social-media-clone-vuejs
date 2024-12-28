import * as crypto from 'node:crypto';

import {pool} from './configRepos.js';

export async function findAll() {
    const session = await pool.acquire();
    const result = await session.select().from('User').all();
    await session.close();
    return result;
}

export async function findById(id) {
    const session = await pool.acquire();
    return await session.select().from('User').where({'id': id}).one();
}

export async function findByUsername(username) {
    const session = await pool.acquire();
    return await session.select().from('User').where({'username': username}).one();
}

export async function save(user) {
    const session = await pool.acquire();
    const existing = await session.select().from('User').where({'username': user.username}).or({'email': user.email}).one();
    if (existing) {
        throw new Error('User with this username or email already exists');
    }
    user['id'] = crypto.randomUUID();
    user['dateRegistered'] = new Date();
    return await session.create('VERTEX', 'User').set(user).one();
}

export async function deleteById(id) {
    const session = await pool.acquire();
    const result = await session.delete('VERTEX', 'User').where({'id': id}).one()
    await session.close();
    return result;
}

export async function deleteByUsername(username) {
    const session = await pool.acquire();
    const result = await session.delete('VERTEX', 'User').where({'username': username}).one()
    await session.close();
    return result;
}

export async function follow(follower, followedUsername) {
    if (follower.username === followedUsername) {
        throw new Error('Cannot follow yourself');
    }
    const session = await pool.acquire();
    session.begin();
    const followed = await session.select().from('User').where({'username': followedUsername}).one();
    if (!followed) {
        throw new Error('User to follow does not exist');
    }
    const existing = await session.select().from('Follows').where({
        'in': followed['@rid'],
        'out': follower['@rid']
    }).one();
    if (existing) {
        throw new Error('Already following this user');
    } else {
        console.log(follower['@rid'], followed['@rid'])
        const result = await session.create('EDGE', 'Follows').from(follower['@rid']).to(followed['@rid']).one();
        console.log(result)
        session.commit();
    }
    await session.close();
}

export async function unfollow(follower, followedUsername) {
    const session = await pool.acquire();
    const followed = await session.select().from('User').where({'username': followedUsername}).one();
    if (!followed) {
        throw new Error('User to unfollow does not exist');
    }
    const result = await session.delete('EDGE', 'Follows').from(follower['@rid']).to(followed['@rid']).one();
    await session.close();
    if (result['count'] === 0) {
        throw new Error('Not following this user already');
    }
    return result;
}

export async function mute(muter, mutedUsername) {
    if (muter.username === mutedUsername) {
        throw new Error('Cannot mute yourself');
    }
    const session = await pool.acquire();
    session.begin();
    const muted = await session.select().from('User').where({'username': mutedUsername}).one();
    if (!muted) {
        throw new Error('User to mute does not exist');
    }
    const existing = await session.select().from('Mutes').where({
        'in': muted['@rid'],
        'out': muter['@rid']
    }).one();
    if (existing) {
        throw new Error('Already muted this user');
    }
    const result = await session.create('EDGE', 'Follows').from(muter['@rid']).to(muted['@rid']).one();
    console.log(result)
    session.commit();
    await session.close();
}

export async function unmute(muter, mutedUsername) {
    const session = await pool.acquire();
    const muted = await session.select().from('User').where({'username': mutedUsername}).one();
    if (!muted) {
        throw new Error('User to unmute does not exist');
    }
    const result = await session.delete('EDGE', 'Mutes').from(muter['@rid']).to(muted['@rid']).one();
    if (result['count'] === 0) {
        throw new Error('User is not muted already');
    }
    await session.close();
    return result;
}

export async function block(blocker, blockedUsername) {
    if (blocker.username === blockedUsername) {
        throw new Error('Cannot block yourself');
    }
    const session = await pool.acquire();
    session.begin();
    const blocked = await session.select().from('User').where({'username': blockedUsername}).one();
    if (!blocked) {
        throw new Error('User to block does not exist');
    }
    const existing = await session.select().from('Blocks').where({
        'in': blocked['@rid'],
        'out': blocker['@rid']
    }).one();
    if (existing) {
        throw new Error('Already blocked this user');
    }
    const result = await session.create('EDGE', 'Blocks').from(blocker['@rid']).to(blocked['@rid']).one();
    console.log(result)
    session.commit();
    await session.close();
}

export async function unblock(blocker, blockedUsername) {
    const session = await pool.acquire();
    const blocked = await session.select().from('User').where({'username': blockedUsername}).one();
    if (!blocked) {
        throw new Error('User to unblock does not exist');
    }
    const result = await session.delete('EDGE', 'Blocks').from(blocker['@rid']).to(blocked['@rid']).one();
    if (result['count'] === 0) {
        throw new Error('User is not blocked already');
    }
    await session.close();
    return result;
}