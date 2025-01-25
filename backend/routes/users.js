import express from 'express';
import Joi from 'joi';
import * as userRepo from '../repository/userRepository.js';
import * as postRepo from '../repository/postRepository.js';
import passport from 'passport';
import bcrypt from 'bcryptjs';
import {broadcastFollowNotification} from "../sio.js";

const router = express.Router();

// helpers
const defaultAllowedFields = ['id', 'username', 'displayName', 'dateRegistered', 'following', 'blocked', 'muted'];

const filterFields = (obj) => Object.fromEntries(
    Object.entries(obj).filter(([key]) => defaultAllowedFields.includes(key))
);

const userRegistrationSchema = Joi.object({
    username: Joi.string().required(),
    email: Joi.string().email().required(),
    displayName: Joi.string().required(),
    password: Joi.string().required(),
});

// routes
router.get('/', passport.authenticate('jwt', {session: false}), async (req, res) => {
    const user = req.user;
    const users = await userRepo.findAll(user);
    // const usersDto = users.map(user => filterFields(user));
    res.status(200).json(users);
});

// !!! must be before /:username
router.get('/me', passport.authenticate('jwt', {session: false}), async (req, res) => {
    const user = await userRepo.findMyInfo(req.user);
    res.status(200).json(user);
});

// !!! must be after /me
router.get('/:username', passport.authenticate('jwt', {session: false}), async (req, res) => {
    const username = req.params.username;
    const user = req.user;
    const foundUser = await userRepo.findByUsernameWithInfo(username, user);
    if (foundUser) {
        res.status(200).json(foundUser);
    } else {
        res.status(404).json({message: 'User not found'});
    }
});




router.post('/', async (req, res) => {
    const {value, error} = userRegistrationSchema.validate(req.body);
    if (error) {
        return res.status(400).json({message: error.message});
    }
    try {
        value.password = await bcrypt.hash(value.password, 10);
        const user = await userRepo.save(value);
        res.status(201).json(user);
    } catch (e) {
        res.status(500).json({message: e.message});
    }
});

router.delete('/:username', async (req, res) => {
    const id = req.params.id;
    try {
        await userRepo.deleteByUsername(id);
        res.status(204).end();
    } catch (e) {
        res.status(500).json({message: e.message});
    }
});

router.post('/:username/follow', passport.authenticate('jwt', {session: false}), async (req, res) => {
    const username = req.params.username;
    const user = req.user;
    try {
        await userRepo.follow(user, username);
        broadcastFollowNotification(username, user)
        res.status(200).end();
    } catch (e) {
        res.status(500).json({message: e.message});
    }
});

router.post('/:username/unfollow', passport.authenticate('jwt', {session: false}), async (req, res) => {
    const username = req.params.username;
    const user = req.user;
    try {
        await userRepo.unfollow(user, username);
        res.status(200).end();
    } catch (e) {
        res.status(500).json({message: e.message});
    }
});

router.post('/:username/mute', passport.authenticate('jwt', {session: false}), async (req, res) => {
    const username = req.params.username;
    const user = req.user;
    try {
        await userRepo.mute(user, username);
        res.status(200).end();
    } catch (e) {
        res.status(500).json({message: e.message});
    }
});

router.post('/:username/unmute', passport.authenticate('jwt', {session: false}), async (req, res) => {
    const username = req.params.username;
    const user = req.user;
    try {
        await userRepo.unmute(user, username);
        res.status(200).end();
    } catch (e) {
        res.status(500).json({message: e.message});
    }
});

router.post('/:username/block', passport.authenticate('jwt', {session: false}), async (req, res) => {
    const username = req.params.username;
    const user = req.user;
    try {
        await userRepo.block(user, username);
        res.status(200).end();
    } catch (e) {
        res.status(500).json({message: e.message});
    }
});

router.post('/:username/unblock', passport.authenticate('jwt', {session: false}), async (req, res) => {
    const username = req.params.username;
    const user = req.user;
    try {
        await userRepo.unblock(user, username);
        res.status(200).end();
    } catch (e) {
        res.status(500).json({message: e.message});
    }
});

router.get('/:username/following', passport.authenticate('jwt', {session: false}), async (req, res) => {
    const username = req.params.username;
    const user = req.user;
    try {
        const users = await userRepo.findFollowing(username, user);
        res.status(200).json(users);
    } catch (e) {
        res.status(500).json({message: e.message});
    }
});

router.get('/:username/followers', passport.authenticate('jwt', {session: false}), async (req, res) => {
    const username = req.params.username;
    const user = req.user;
    try {
        const users = await userRepo.findFollowers(username, user);
        res.status(200).json(users);
    } catch (e) {
        res.status(500).json({message: e.message});
    }
});

router.get('/:username/blocked', passport.authenticate('jwt', {session: false}), async (req, res) => {
    const username = req.params.username;
    const user = req.user;
    try {
        const users = await userRepo.findBlocked(username, user);
        res.status(200).json(users);
    } catch (e) {
        res.status(500).json({message: e.message});
    }
});

router.get('/:username/muted', passport.authenticate('jwt', {session: false}), async (req, res) => {
    const username = req.params.username;
    const user = req.user;
    try {
        const users = await userRepo.findMuted(username, user);
        res.status(200).json(users);
    } catch (e) {
        res.status(500).json({message: e.message});
    }
});

export default router;
