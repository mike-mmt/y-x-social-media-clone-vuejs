import express from 'express';

const router = express.Router();
import Joi from 'joi';
import * as postRepo from '../repository/postRepository.js';
import passport from 'passport';
import {
    broadcastPostLike,
    broadcastPostNewReply,
    broadcastPostUnlike, broadcastUserPostLikeNotification,
    broadcastUserPostReplyNotification
} from '../sio.js';

// helpers
const defaultAllowedFields = ['id', 'author', 'body', 'datePosted', 'media', 'likesCount', 'childCount'];

// noinspection DuplicatedCode
const filterFields = (obj) => Object.fromEntries(
    Object.entries(obj).filter(([key]) => defaultAllowedFields.includes(key))
);

// schema for posting a post
const postSchema = Joi.object({
    body: Joi.string().min(1),
    media: Joi.string().min(1).uri(),
    parent: Joi.string(),
}).or('body', 'media');

// routes
router.get('/', passport.authenticate('jwt', {session: false}), async (req, res) => {
    const posts = await postRepo.findAll();
    const postsDto = posts.map(post => filterFields(post));
    res.status(200).json(posts);
});

router.get('/id/:id', passport.authenticate('jwt', {session: false}), async (req, res) => {
    const id = req.params.id;
    const user = req.user;
    const post = await postRepo.findById(id, user);
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
        const post = await postRepo.save(value, req.user);
        if (post["parent"]) {
            const parentPost = await postRepo.findById(post["parent"], req.user);
            if (parentPost) {
                console.log("backend: route: post", parentPost)
                broadcastPostNewReply(post["parent"], post);
                broadcastUserPostReplyNotification(parentPost.authorUsername, parentPost, post);
            }
        }
        res.status(201).json(post);
    } catch (e) {
        console.error(e);
        res.status(500).json({message: e.message});
    }
});

router.get('/id/:id/replies', passport.authenticate('jwt', {session: false}), async (req, res) => {
    const id = req.params.id;
    const user = req.user;
    try {
        const replies = await postRepo.findReplies(id, user);
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
        // console.log(id, value)
        const post = await postRepo.save({...value, parent: id}, req.user);
        res.status(201).json(post);
    } catch (e) {
        console.error(e);
        res.status(500).json({message: e.message});
    }
});

router.delete('/id/:id', passport.authenticate('jwt', {session: false}), async (req, res) => {
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
        const like = await postRepo.like(id, req.user);
        const likedPost = await postRepo.findById(id, req.user);
        console.log("backend: route: like", like)
        broadcastPostLike(id, req.user.username);
        broadcastUserPostLikeNotification(likedPost.authorUsername, likedPost, req.user);
        res.status(200).json(like);
    } catch (e) {
        res.status(500).json({message: e.message});
    }
});

router.post('/id/:id/unlike', passport.authenticate('jwt', {session: false}), async (req, res) => {
    const id = req.params.id;
    try {
        const post = await postRepo.unlike(id, req.user);
        broadcastPostUnlike(id, req.user.username);
        res.status(200).json(post);
    } catch (e) {
        res.status(500).json({message: e.message});
    }
});

// advanced
router.get('/followed', passport.authenticate('jwt', {session: false}), async (req, res) => {
    const user = req.user;
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
    const user = req.user;
    try {
        // const posts = await postRepo.findNewestFromFollowedWithPagination(user, 0, 10);
        const posts = await postRepo.findNewestFromRandomNonFollowedWithPagination(user, page, limit, amountOfUsers);
        res.status(200).json(posts);
    } catch (e) {
        console.error(e);
        res.status(500).json({message: e.message});
    }
});

router.get('/foryou', passport.authenticate('jwt', {session: false}), async (req, res) => {
    let {page} = req.query;
    page = parseInt(page) || 0;
    // amountOfUsers = Math.min(parseInt(amountOfUsers) || 10, 100);
    // limit = Math.min(parseInt(limit) || 10, 100);
    const limit = 5;
    const amountOfUsers = limit;
    const user = req.user;
    try {
        const followedPosts = await postRepo.findNewestFromFollowedWithPagination(user, page, limit);
        const randomPosts = await postRepo.findNewestFromRandomNonFollowedWithPagination(user, page, limit, amountOfUsers);
        res.status(200).json([...followedPosts, ...randomPosts]);
    } catch (e) {
        console.error(e);
        res.status(500).json({message: e.message});
    }
});

router.get('/my', passport.authenticate('jwt', {session: false}), async (req, res) => {
    const user = req.user;
    let {page} = req.query;
    let limit = 10;
    page = parseInt(page) || 0;
    // limit = Math.min(parseInt(limit) || 10, 100);
    try {
        const posts = await postRepo.findMyPosts(user, page, limit);
        res.status(200).json(posts);
    } catch (e) {
        console.error(e);
        res.status(500).json({message: e.message});
    }
});

router.get('/user/:username', passport.authenticate('jwt', {session: false}), async (req, res) => {
    const username = req.params.username;
    const page = parseInt(req.query.page) || 0;
    const user = req.user;
    try {
        const posts = await postRepo.findUserPosts(username, user, page, 10);
        res.status(200).json(posts);
    } catch (e) {
        res.status(500).json({message: e.message});
    }
});

export default router;