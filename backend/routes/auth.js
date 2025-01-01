import jwt from 'jsonwebtoken';
const router = express.Router();
export default router;
import * as userRepo from "../repository/userRepository.js";
import bcrypt from 'bcryptjs';

import express from 'express';
import passport from 'passport';

const secretKey = process.env.JWT_SECRET || 'JHM89asd0Y0A$$$HgbCF';

router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = await userRepo.findByUsername(username);
        if (!user) {
            return res.status(401).json({
                message: `W bazie brak danych użytkownika „${username}”`
            });
        }
        const authenticated = await bcrypt.compare(password, user.password);
        if (!authenticated) {
            return res.status(401).json({
                message: 'Uwierzytelnienie nie powiodło się – niepoprawne hasło' });
        }
        const token = jwt.sign({ userId: user.id }, secretKey, {
            expiresIn: '30d',
        });
        res.status(200).json({
            message: `Użytkownik „${username}” zalogowany poprawnie`,
            Authorization: token
        });
    } catch (error) {
        res.status(500).json({
            message: 'Logowanie nie powiodło się',
            error
        });
    }
});

router.post('/validate', passport.authenticate('jwt', {session: false}), async (req, res) => {
    res.status(200).json({message: 'success'});
});