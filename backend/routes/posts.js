import express from 'express';

const router = express.Router();
import Joi from 'joi';
import * as postRepo from '../repository/postRepository.js';
import passport from 'passport';

// helpers
const defaultAllowedFields = ['id', 'author', 'body', 'datePosted', 'media', 'likesCount', 'childCount'];

// noinspection DuplicatedCode
const filterFields = (obj) => Object.fromEntries(
    Object.entries(obj).filter(([key]) => defaultAllowedFields.includes(key))
);

// schema for posting a post
const postSchema = Joi.object({
    body: Joi.string(),
    media: Joi.string(),
    parent: Joi.string(),
}).xor('body', 'media');

// routes
router.get('/', passport.authenticate('jwt', {session: false}), async (req, res) => {
    const posts = await postRepo.findAll();
    const postsDto = posts.map(post => filterFields(post));
    res.status(200).json(posts);
});

router.get('/id/:id', async (req, res) => {
    const id = req.params.id;
    const post = await postRepo.findById(id);
    if (post) {
        res.status(200).json(post);
    } else {
        res.status(404).json({message: 'Post not found'});
    }
});

router.post('/', passport.authenticate('jwt', {session: false}), async (req, res) => {
    const {value, error} = postSchema.validate(req.body);
    if (error) {
        return res.status(400).json({message: error.message});
    }
    try {
        const post = await postRepo.save(value, await req.user);
        res.status(201).json(post);
    } catch (e) {
        console.error(e);
        res.status(500).json({message: e.message});
    }
});

router.get('/id/:id/replies', passport.authenticate('jwt', {session: false}), async (req, res) => {
    const id = req.params.id;
    try {
        const replies = await postRepo.findReplies(id);
        res.status(200).json(replies);
    } catch (e) {
        console.error(e);
        res.status(500).json({message: e.message});
    }
});

router.post('/id/:id/replies', passport.authenticate('jwt', {session: false}), async (req, res) => {
    const id = req.params.id;
    const {value, error} = postSchema.validate(req.body);
    if (error) {
        return res.status(400).json({message: error.message});
    }
    try {
        console.log(id, value)
        const post = await postRepo.save({...value, parent: id}, await req.user);
        res.status(201).json(post);
    } catch (e) {
        console.error(e);
        res.status(500).json({message: e.message});
    }
});

router.delete('/id/:id', async (req, res) => {
    const id = req.params.id;
    try {
        await postRepo.deleteById(id);
        res.status(204).end();
    } catch (e) {
        res.status(500).json({message: e.message});
    }
});

// like/unlike
router.post('/id/:id/like', passport.authenticate('jwt', {session: false}), async (req, res) => {
    const id = req.params.id;
    try {
        const post = await postRepo.like(id, await req.user);
        res.status(200).json(post);
    } catch (e) {
        res.status(500).json({message: e.message});
    }
});

router.post('/id/:id/unlike', passport.authenticate('jwt', {session: false}), async (req, res) => {
    const id = req.params.id;
    try {
        const post = await postRepo.unlike(id, await req.user);
        res.status(200).json(post);
    } catch (e) {
        res.status(500).json({message: e.message});
    }
});

// advanced
router.get('/followed', passport.authenticate('jwt', {session: false}), async (req, res) => {
    const user = await req.user;
    let {page, limit, amountOfUsers} = req.query;
    page = parseInt(page) || 0;
    limit = Math.min(parseInt(limit) || 10, 100);
    try {
        const posts = await postRepo.findNewestFromFollowedWithPagination(user, page, limit);
        // const posts = await postRepo.findNewestFromRandomNonFollowedWithPagination(user, 0, 10);
        res.status(200).json(posts);
    } catch (e) {
        console.error(e);
        res.status(500).json({message: e.message});
    }
});

router.get('/nonfollowed', passport.authenticate('jwt', {session: false}), async (req, res) => {
    let {page, limit, amountOfUsers} = req.query;
    page = parseInt(page) || 0;
    amountOfUsers = Math.min(parseInt(amountOfUsers) || 10, 100);
    limit = Math.min(parseInt(limit) || 10, 100);
    const user = await req.user;
    try {
        // const posts = await postRepo.findNewestFromFollowedWithPagination(user, 0, 10);
        const posts = await postRepo.findNewestFromRandomNonFollowedWithPagination(user, page, limit, amountOfUsers);
        res.status(200).json(posts);
    } catch (e) {
        console.error(e);
        res.status(500).json({message: e.message});
    }
});

export default router;