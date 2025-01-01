// import * as userRepo from "./repository/userRepository";
// passport.use(
//     new Strategy(opts, async (payload, done) => {
//         try {
//             const user = await userRepo.getById(payload.id);
//             if (user) return done(null, user);
//         } catch (error) {
//             return done(error, false);
//         }
//     })
// );

import { ExtractJwt, Strategy } from "passport-jwt";
import passport from 'passport';
import * as userRepo from './repository/userRepository.js';

const opts = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: process.env.JWT_SECRET || 'JHM89asd0Y0A$$$HgbCF'
};

// noinspection JSCheckFunctionSignatures
passport.use(
    new Strategy(opts, async (payload, done) => {
        try {
            const user = await userRepo.findById(payload.userId);
            if (user) return done(null, user);
        } catch (error) {
            return done(error);
        }
    })
);
// const passportConfig = passport => {
//     passport.use(
//         new Strategy(opts, (jwt_payload, done) => {
//             console.log(jwt_payload);
//             return done(null, jwt_payload.userId);
//         })
//     );
// };
// export default passportConfig;
// https://github.com/mikenicholson/passport-jwt#extracting-the-jwt-from-the-request
