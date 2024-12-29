import * as userRepo from './userRepository.js';
import * as postRepo from './postRepository.js';
import bcrypt from 'bcryptjs';
import Joi from 'joi';

const postSchema = Joi.object({
    body: Joi.string(),
    media: Joi.string(),
    parent: Joi.string(),
}).xor('body', 'media');

export async function initDatabase() {
    let user1 = {
        username: 'userone',
        email: 'userone@mail.com',
        displayName: 'User One',
        password: await bcrypt.hash('verysecret123', 10),
    }
    let user2 = {
        username: 'usertwo',
        email: 'usertwo@mail.com',
        displayName: 'User Two',
        password: await bcrypt.hash('verysecret123', 10),
    }
    let user3 = {
        username: 'userthree',
        email: 'userthree@mail.com',
        displayName: 'User Three',
        password: await bcrypt.hash('verysecret123', 10),
    }
    user1 = await userRepo.save(user1);
    user2 = await userRepo.save(user2);
    user3 = await userRepo.save(user3);

    await userRepo.follow(user2, user1.username);
    await userRepo.follow(user3, user1.username);
    await userRepo.follow(user3, user2.username);
    await userRepo.follow(user1, user2.username);

    let post1 = {
        body: 'What a wonderful day!',
    }
    post1 = await postRepo.save(post1, user1);
    let post2 = {
        body: 'Woo, let\'s go!',
        parent: post1.id,
    }
    post2 = await postRepo.save(post2, user2);
    let post3 = {
        body: 'I am excited!',
        parent: post1.id,
    }
    post3 = await postRepo.save(post3, user3);
    const post4 = {
        body: 'That\'s the spirit!',
        parent: post2.id,
    }
    await postRepo.save(post4, user3);
    let post5 = {
        body: 'bored out of my mind'
    }
    post5 = await postRepo.save(post5, user2);

    await postRepo.like(post1.id, user2);
    await postRepo.like(post1.id, user3);
    await postRepo.like(post2.id, user3);
    await postRepo.like(post5.id, user1);

}

