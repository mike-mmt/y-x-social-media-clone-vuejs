import express from 'express';
import Joi from 'joi';
import * as userRepo from '../repository/userRepository.js';
import passport from 'passport';
import bcrypt from 'bcryptjs';

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
router.get('/', async (req, res) => {
    const users = await userRepo.findAll();
    const usersDto = users.map(user => filterFields(user));
    res.status(200).json(users);
});

router.get('/:username', async (req, res) => {
    const username = req.params.username;
    const user = await userRepo.findByUsername(username);
    if (user) {
        res.status(200).json(user);
    }
    res.status(404).json({message: 'User not found'});
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

router.delete('/:id', async (req, res) => {
    const id = req.params.id;
    try {
        await userRepo.deleteById(id);
        res.status(204).end();
    } catch (e) {
        res.status(500).json({message: e.message});
    }
});

router.post('/:username/follow', passport.authenticate('jwt', {session: false}), async (req, res) => {
    const username = req.params.username;
    const user = await req.user;
    console.log(user);
    try {
        await userRepo.follow(user, username);
        res.status(200).end();
    } catch (e) {
        res.status(500).json({message: e.message});
    }
});

router.post('/:username/unfollow', passport.authenticate('jwt', {session: false}), async (req, res) => {
    const username = req.params.username;
    const user = await req.user;
    try {
        await userRepo.unfollow(user, username);
        res.status(200).end();
    } catch (e) {
        res.status(500).json({message: e.message});
    }
});

router.post('/:username/mute', passport.authenticate('jwt', {session: false}), async (req, res) => {
    const username = req.params.username;
    const user = await req.user;
    try {
        await userRepo.mute(user, username);
        res.status(200).end();
    } catch (e) {
        res.status(500).json({message: e.message});
    }
});

router.post('/:username/unmute', passport.authenticate('jwt', {session: false}), async (req, res) => {
    const username = req.params.username;
    const user = await req.user;
    try {
        await userRepo.unmute(user, username);
        res.status(200).end();
    } catch (e) {
        res.status(500).json({message: e.message});
    }
});

router.post('/:username/block', passport.authenticate('jwt', {session: false}), async (req, res) => {
    const username = req.params.username;
    const user = await req.user;
    try {
        await userRepo.block(user, username);
        res.status(200).end();
    } catch (e) {
        res.status(500).json({message: e.message});
    }
});

export default router;
