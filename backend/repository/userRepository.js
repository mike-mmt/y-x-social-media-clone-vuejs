import * as crypto from 'node:crypto';

import {pool} from './configRepos.js';

const USER_PROJECTION = `*, out('Follows').size() AS followingCount,
 in('Follows').size() AS followersCount,
   first(  (SELECT COUNT(*) AS isFollowing FROM (SELECT expand(in('Follows')) FROM $current) WHERE @rid = :userRid)).isFollowing AS isFollowing,
   first(  (SELECT COUNT(*) AS isMuted FROM (SELECT expand(in('Muted')) FROM $current) WHERE @rid = :userRid)).isMuted AS isMuted,
   first(  (SELECT COUNT(*) AS isBlocked FROM (SELECT expand(in('Blocked')) FROM $current) WHERE @rid = :userRid)).isBlocked AS isBlocked`;

export async function findAll(user) {
    const session = await pool.acquire();
    const result = await session.query(`${USER_PROJECTION}`, {params: {userRid: user['@rid']}}).all();
    await session.close();
    return result;
}

export async function findById(id) {
    const session = await pool.acquire();
    const result = await session.query(`SELECT * FROM User WHERE id = :id`, {
        params: {id}
    }).one()
    await session.close();
    return result
}

export async function findByUsername(username) {
    const session = await pool.acquire();
    const result = await session.query(`SELECT FROM User WHERE username = :username`, {
        params: {
            username: username,
        }
    }).one()
    await session.close();
    return result
}

export async function findByUsernameWithInfo(username, user) {
    const session = await pool.acquire();
    const result = await session.query(`SELECT ${USER_PROJECTION} FROM User WHERE username = :username`, {
        params: {
            username: username,
            userRid: user['@rid']
        }
    }).one()
    await session.close();
    return result
}

export async function save(user) {
    const session = await pool.acquire();
    const existing = await session.select().from('User').where({'username': user.username}).or({'email': user.email}).one();
    if (existing) {
        throw new Error('User with this username or email already exists');
    }
    user['id'] = crypto.randomUUID();
    user['dateRegistered'] = new Date();
    const created = await session.create('VERTEX', 'User').set(user).one();
    await session.close();
    created['followingCount'] = 0;
    created['followersCount'] = 0;
    created['isFollowing'] = 0;
    return created;
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
        // console.log(follower['@rid'], followed['@rid'])
        const result = await session.create('EDGE', 'Follows').from(follower['@rid']).to(followed['@rid']).one();
        // console.log(result)
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
    const existing = await session.select().from('Muted').where({
        'in': muted['@rid'],
        'out': muter['@rid']
    }).one();
    if (existing) {
        throw new Error('Already muted this user');
    }
    const result = await session.create('EDGE', 'Muted').from(muter['@rid']).to(muted['@rid']).one();
    // console.log(result)
    session.commit();
    await session.close();
}

export async function unmute(muter, mutedUsername) {
    const session = await pool.acquire();
    const muted = await session.select().from('User').where({'username': mutedUsername}).one();
    if (!muted) {
        throw new Error('User to unmute does not exist');
    }
    const result = await session.delete('EDGE', 'Muted').from(muter['@rid']).to(muted['@rid']).one();
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
    const existing = await session.select().from('Blocked').where({
        'in': blocked['@rid'],
        'out': blocker['@rid']
    }).one();
    if (existing) {
        throw new Error('Already blocked this user');
    }
    const result = await session.create('EDGE', 'Blocked').from(blocker['@rid']).to(blocked['@rid']).one();
    // console.log(result)
    session.commit();
    await session.close();
}

export async function unblock(blocker, blockedUsername) {
    const session = await pool.acquire();
    const blocked = await session.select().from('User').where({'username': blockedUsername}).one();
    if (!blocked) {
        throw new Error('User to unblock does not exist');
    }
    const result = await session.delete('EDGE', 'Blocked').from(blocker['@rid']).to(blocked['@rid']).one();
    if (result['count'] === 0) {
        throw new Error('User is not blocked already');
    }
    await session.close();
    return result;
}

export async function findFollowers(username) {
    const session = await pool.acquire();
    const result = await session.query(`SELECT ${USER_PROJECTION} FROM (SELECT expand(in('Follows')) FROM User WHERE username = :username)`, {
        params: {
            username: username
        }
    }).all();
    await session.close();
    return result;
}

export async function findFollowing(username, user) {
    const session = await pool.acquire();
    const result = await session.query(`SELECT ${USER_PROJECTION} FROM (SELECT expand(out('Follows')) FROM User WHERE username = :username)`, {
        params: {
            username: username,
            userRid: user['@rid']
        }
    }).all();
    await session.close();
    return result;
}

export async function findMuted(username, user) {
    const session = await pool.acquire();
    const result = await session.query(`SELECT ${USER_PROJECTION} FROM (SELECT expand(out('Muted')) FROM User WHERE username = :username)`, {
        params: {
            username: username,
            userRid: user['@rid']
        }
    }).all();
    await session.close();
    return result;
}

export async function findBlocked(username, user) {
    const session = await pool.acquire();
    const result = await session.query(`SELECT ${USER_PROJECTION} FROM (SELECT expand(out('Blocked')) FROM User WHERE username = :username)`, {
        params: {
            username: username,
            userRid: user['@rid']
        }
    }).all();
    await session.close();
    return result;
}

export async function findMyInfo(user) {
    const session = await pool.acquire();
    const result = await session.query(`SELECT ${USER_PROJECTION}, out('Muted').size() AS mutedCount, out('Blocked').size() AS blockedCount FROM User WHERE @rid = :userRid`, {
        params: {
            userRid: user['@rid']
        }
    }).one()
    await session.close();
    return result
}