import express from "express";
const router = express.Router();
import Joi from "joi";
import * as userRepo from "../repository/userRepository.js";

// helpers
const defaultAllowedFields = ["id", "username", "displayName", "dateRegistered", "following", "blocked", "muted"];

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
router.get("/", async (req, res) => {
    const users = await userRepo.getAll();
    const usersDto = users.map(user => filterFields(user));
    res.status(200).json(usersDto);
});

router.get("/:id", async (req, res) => {
    const id = req.params.id;
    const user = await userRepo.getById(id);
    if (user) {
        res.status(200).json(filterFields(user));
    }
    res.status(404).json({message: "User not found"});
});

router.post("/", async (req, res) => {
    const {value, error} = userRegistrationSchema.validate(req.body);
    if (error) {
        return res.status(400).json({message: error.message});
    }
    try {
        const user = await userRepo.save(value);
        res.status(201).json(filterFields(user));
    } catch (e) {
        res.status(500).json({message: e.message});
    }
});

router.delete("/:id", async (req, res) => {
    const id = req.params.id;
    try {
        await userRepo.deleteById(id);
        res.status(204).end();
    } catch (e) {
        res.status(500).json({message: e.message});
    }
});

export default router;
