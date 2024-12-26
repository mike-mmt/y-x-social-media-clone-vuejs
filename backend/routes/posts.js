import express from "express";
const router = express.Router();
import Joi from "joi";
import * as postRepo from "../repository/postRepository.js";

// helpers
const defaultAllowedFields = ["id", "author", "body", "datePosted", "media", "likesCount", "childCount"];

// noinspection DuplicatedCode
const filterFields = (obj) => Object.fromEntries(
    Object.entries(obj).filter(([key]) => defaultAllowedFields.includes(key))
);

const postSchema = Joi.object({
    body: Joi.string(),
    media: Joi.string(),
});

// routes
router.get("/", async (req, res) => {
    const posts = await postRepo.getAll();
    const postsDto = posts.map(post => filterFields(post));
    res.status(200).json(postsDto);
});

router.get("/:id", async (req, res) => {
    const id = req.params.id;
    const post = await postRepo.getById(id);
    if (post) {
        res.status(200).json(filterFields(post));
    }
    res.status(404).json({message: "Post not found"});
});

router.post("/", async (req, res) => {
    const {value, error} = postSchema.validate(req.body);
    if (error) {
        return res.status(400).json({message: error.message});
    }
    try {
        const post = await postRepo.save(value);
        res.status(201).json(filterFields(post));
    } catch (e) {
        res.status(500).json({message: e.message});
    }
});

router.delete("/:id", async (req, res) => {
    const id = req.params.id;
    try {
        await postRepo.deleteById(id);
        res.status(204).end();
    } catch (e) {
        res.status(500).json({message: e.message});
    }
});

export default router;
