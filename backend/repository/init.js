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
    try {
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

        const existingPosts = await postRepo.findAll();
        if (existingPosts.length === 0) {
            await initPosts(user1, user2, user3);
        }
    } catch (e) {
        console.log('caught, going another way');
        try {
            console.log('trying to find users');
            const user1 = await userRepo.findByUsername('userone');
            const user2 = await userRepo.findByUsername('usertwo');
            const user3 = await userRepo.findByUsername('userthree');
            console.log(user1)
            const existingPosts = await postRepo.findAll();
            if (existingPosts.length === 0) {
                await initPosts(user1, user2, user3);
            }
        } catch (e2) {
            console.error('Error initializing database:', e2);
        }
    }
}

async function slowDown() {
    return new Promise(resolve => setTimeout(resolve, 1000));
}

async function initPosts(user1, user2, user3) {
    let post1 = {
        body: 'What a wonderful day!',
    }
    post1 = await postRepo.save(post1, user1);
    await slowDown();
    let post2 = {
        body: 'Woo, let\'s go!',
        parent: post1.id,
    }
    post2 = await postRepo.save(post2, user2);
    await slowDown();
    let post3 = {
        body: 'I am excited!',
        parent: post1.id,
    }
    post3 = await postRepo.save(post3, user3);
    await slowDown();
    let post4 = {
        body: 'That\'s the spirit!',
        parent: post2.id,
    }
    post4 = await postRepo.save(post4, user3);
    let post5 = {
        body: 'bored out of my mind'
    }
    post5 = await postRepo.save(post5, user2);
    let post6 = {
        body: 'Just finished a great book! Highly recommend it.'
    }
    post6 = await postRepo.save(post6, user1);

    let post7 = {
        body: 'Nothing like a cup of coffee to start the day!'
    }
    post7 = await postRepo.save(post7, user2);

    let post8 = {
        body: 'Feeling grateful for all the good vibes today.'
    }
    post8 = await postRepo.save(post8, user3);

    let post9 = {
        body: 'Anyone up for a movie marathon this weekend?',
        parent: post6.id,
    }
    post9 = await postRepo.save(post9, user1);

    let post10 = {
        body: 'Sunsets never fail to amaze me. Nature is incredible.'
    }
    post10 = await postRepo.save(post10, user2);

    let post11 = {
        body: 'Workout done! Feeling pumped and ready to take on the world.'
    }
    post11 = await postRepo.save(post11, user3);

    let post12 = {
        body: 'Learning a new recipe today. Wish me luck!'
    }
    post12 = await postRepo.save(post12, user1);

    let post13 = {
        body: 'Long day at work, but I\'m finally home and relaxing.'
    }
    post13 = await postRepo.save(post13, user2);

    let post14 = {
        body: 'Taking a break from social media. See you all soon!'
    }
    post14 = await postRepo.save(post14, user3);

    let post15 = {
        body: 'So excited for the upcoming holiday season!'
    }
    post15 = await postRepo.save(post15, user1);

    let post16 = {
        body: 'Music makes everything better. Jamming out right now!'
    }
    post16 = await postRepo.save(post16, user2);

    let post17 = {
        body: 'Productivity level: 100 today! Let\'s keep it going.'
    }
    post17 = await postRepo.save(post17, user3);

    let post18 = {
        body: 'Started a new hobby. Can\'t wait to share more soon!'
    }
    post18 = await postRepo.save(post18, user1);

    let post19 = {
        body: 'Grabbing lunch at my favorite spot. Yummy!'
    }
    post19 = await postRepo.save(post19, user2);

    let post20 = {
        body: 'Thinking about life\'s mysteries while staring at the stars.'
    }
    post20 = await postRepo.save(post20, user3);

    let post21 = {
        body: 'Back at the gym! Feeling stronger every day.'
    }
    post21 = await postRepo.save(post21, user1);

    let post22 = {
        body: 'Time to reorganize my workspace. Clean space, clear mind!'
    }
    post22 = await postRepo.save(post22, user2);

    let post23 = {
        body: 'Weekend getaway planned. Can\'t wait for some adventure!'
    }
    post23 = await postRepo.save(post23, user3);

    let post24 = {
        body: 'Late-night thoughts and a cup of tea. Perfect combo.'
    }
    post24 = await postRepo.save(post24, user1);

    let post25 = {
        body: 'Looking for podcast recommendations. Any favorites?'
    }
    post25 = await postRepo.save(post25, user2);

    let post26 = {
        body: 'Finished a challenging puzzle. Victory!'
    }
    post26 = await postRepo.save(post26, user3);

    let post27 = {
        body: 'Reflecting on how far I\'ve come. Grateful for the journey.'
    }
    post27 = await postRepo.save(post27, user1);

    let post28 = {
        body: 'Experimenting with new photography techniques today.'
    }
    post28 = await postRepo.save(post28, user2);

    let post29 = {
        body: 'Excited for tonight\'s game! Go team!'
    }
    post29 = await postRepo.save(post29, user3);

    let post30 = {
        body: 'Morning run done. Feeling refreshed and ready to tackle the day.'
    }
    post30 = await postRepo.save(post30, user1);

    let post31 = {
        body: 'Cooking up something special tonight. Stay tuned!'
    }
    post31 = await postRepo.save(post31, user2);

    let post32 = {
        body: 'Meditation session complete. Feeling at peace.'
    }
    post32 = await postRepo.save(post32, user3);

    let post33 = {
        body: 'New project at work starting soon. Let\'s go!'
    }
    post33 = await postRepo.save(post33, user1);

    let post34 = {
        body: 'Discovered a hidden gem of a cafe. Cozy and delightful.'
    }
    post34 = await postRepo.save(post34, user2);

    let post35 = {
        body: 'Mid-week check-in: How\'s everyone holding up?'
    }
    post35 = await postRepo.save(post35, user3);

    let post36 = {
        body: 'Late-night coding session underway!'
    }
    post36 = await postRepo.save(post36, user1);

    let post37 = {
        body: 'Reading a new novel. Can\'t put it down!'
    }
    post37 = await postRepo.save(post37, user2);

    let post38 = {
        body: 'Planning a surprise for a friend. Hope they love it!'
    }
    post38 = await postRepo.save(post38, user3);

    let post39 = {
        body: 'Late-night stargazing is my kind of therapy.'
    }
    post39 = await postRepo.save(post39, user1);

    let post40 = {
        body: 'Sketching some ideas for a personal project.'
    }
    post40 = await postRepo.save(post40, user2);

    let post41 = {
        body: 'Trying out a new playlist while working. Feels good!'
    }
    post41 = await postRepo.save(post41, user3);

    //replies
    const reply42 = {
        body: 'That book sounds amazing! Adding it to my list.',
        parent: post6.id,
    }
    await postRepo.save(reply42, user2);

    const reply43 = {
        body: 'Good luck with the recipe! Let us know how it turns out.',
        parent: post12.id,
    }
    await postRepo.save(reply43, user3);

    const reply44 = {
        body: 'Reorganizing always feels great. Hope it goes well!',
        parent: post22.id,
    }
    await postRepo.save(reply44, user1);

    const reply45 = {
        body: 'I love puzzles! Which one did you finish?',
        parent: post26.id,
    }
    await postRepo.save(reply45, user2);

    const reply46 = {
        body: 'I could use some podcast recommendations too!',
        parent: post25.id,
    }
    await postRepo.save(reply46, user3);

    const reply47 = {
        body: 'The sunset really was beautiful today!',
        parent: post10.id,
    }
    await postRepo.save(reply47, user1);

    const reply48 = {
        body: 'I am so ready for the movie marathon!',
        parent: post9.id,
    }
    await postRepo.save(reply48, user3);

    const reply49 = {
        body: 'Adventures are the best! Where are you headed?',
        parent: post23.id,
    }
    await postRepo.save(reply49, user2);

    const reply50 = {
        body: 'I need to get back to the gym too!',
        parent: post21.id,
    }
    await postRepo.save(reply50, user3);

    const reply51 = {
        body: 'Meditation really helps clear the mind.',
        parent: post32.id,
    }
    await postRepo.save(reply51, user1);

    const reply52 = {
        body: 'Good luck with the new project!',
        parent: post33.id,
    }
    await postRepo.save(reply52, user2);

    const reply53 = {
        body: 'Late-night coding is so rewarding!',
        parent: post36.id,
    }
    await postRepo.save(reply53, user3);


    await postRepo.like(post1.id, user2);
    await postRepo.like(post1.id, user3);
    await postRepo.like(post2.id, user3);
    await postRepo.like(post5.id, user1);
}

