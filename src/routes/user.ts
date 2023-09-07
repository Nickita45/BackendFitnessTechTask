import {
    Router,
    Request,
    Response,
    NextFunction
} from 'express'
import jwt from 'jsonwebtoken';
import passport from 'passport';

import { User } from '../db'
import { UserModel } from '../db/user';
import { ROLE } from '../utils/enums';
import { isValidEmail } from '../utils/regexpfunctions';
import crypto from 'crypto';

const router: Router = Router()

export default () => {
    /**
     * /user/profile - GET
     * return information about current user 
     */
    router.get('/profile', passport.authenticate('jwt', { session: false }), async (_req: any, res: Response) => {
        try {
            const user = await User.findByPk(_req.user.id, { attributes: ['name', 'surname', 'age', 'nickName'] });
            if (!user) {
                return res.status(404).json({ message: res.locals.localization.userNotFound });
            }
            return res.status(200).json(user);
        } catch (error) {
            return res.status(500).json({ message: res.locals.localization.serverError });
        }
    });
    // Protected route using jwt and password
    router.get('/protected-route', passport.authenticate('jwt', { session: false }), (_req, res) => {
        // only for authorization
        res.json({ message: res.locals.localization.protectedRoute, user: _req.user });
    });
    /**
     * /user/ - GET
     * return id, nickname if USER
     * return all information if ADMIN
     */
    router.get('/', passport.authenticate('jwt', { session: false }), async (_req: any, res: Response, _next: NextFunction) => {

        let programs = await User.findAll();
        if (_req.user.role != "ADMIN") {
            programs = await User.findAll({ attributes: ['id', 'nickName'] })
        }
        return res.json({
            data: programs,
            message: res.locals.localization.userList
        })
    })
    /**
     * /user/:id - GET
     * parameters:
     *  - id: user id 
     * return information about user by id if ADMIN
     */
    router.get('/:id', passport.authenticate('jwt', { session: false }), async (_req: any, res: Response, _next: NextFunction) => {

        if (_req.user.role != "ADMIN") {
            return res.status(403).json({ message: res.locals.localization.accessDenied });
        }
        if (!_req.query.id) {
            return res.status(401).json({ message: res.locals.localization.wrongId });
        }
        const user = await User.findOne({ where: { id: _req.query.id } });
        if (!user) {
            return res.status(401).json({ message: res.locals.localization.userNotFound });
        }
        return res.json({
            data: user,
            message: res.locals.localization.userInfo
        })
    })
    /**
     * /user/:id - PUT, update to DB a user
     * parameters:
     *  - id: user id 
     *  - name: name user
     *  - surname: surname
     *  - role: can be ADMIN or USER
     *  - age: age of user
     *  - nickname: user nickname, unique field 
     * return information about updated user if ADMIN
     */
    router.put('/:id', passport.authenticate('jwt', { session: false }), async (_req: any, res: Response, _next: NextFunction) => {

        if (_req.user.role != "ADMIN") {
            return res.status(403).json({ message: res.locals.localization.accessDenied });
        }
        if (!_req.query.id) {
            return res.status(401).json({ message: res.locals.localization.wrongId });
        }
        const ifNickNameUsed = await User.findOne({ where: { nickName: _req.query.nickName } });
        if (ifNickNameUsed) {
            return res.status(401).json({ message: res.locals.localization.userNicknameUsed });
        }
        try {
            const user = await User.findByPk(_req.query.id);
            if (!user) {
                return res.status(401).json({ message: res.locals.localization.userNotFound });
            }

            user.name = _req.query.name || user.name;
            const role = _req.query.role && Object.values(ROLE).includes(_req.query.role as ROLE) ? _req.query.role : user.role;
            user.role = role;
            user.surname = _req.query.surname || user.surname;
            user.age = _req.query.age || user.age;
            user.nickName = _req.query.nickName || user.nickName;

            await user.save();


            return res.json({
                data: user,
                message: res.locals.localization.userUpdate
            })
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: res.locals.localization.serverError });
        }
    })
    /**
     * /user/login - POST, login 
     * parameters:
     *  - nickname: user nickname, unique field 
     *  - password: user password, 
     *  - email: email field
     * return jwt token
     */
    router.post('/login', (req: Request, res: Response, next: NextFunction) => {
        passport.authenticate('local', (err: any, user: UserModel, info: any) => {
            if (err) {
                return res.status(500).send(res.locals.localization.serverError);
            }
            if (!user) {
                return res.status(400).json({ msg: res.locals.localization.invalidCredentials });
            }

            req.logIn(user, (err) => {
                if (err) {
                    return res.status(500).send(res.locals.localization.serverError);
                }

                const payload = { user: { id: user.id, name: user.nickName } };

                jwt.sign(payload, 'testket', { expiresIn: '1h' }, (err, token) => {
                    if (err) throw err;
                    res.json({ token });
                });
            });
        })(req, res, next);
    });
     /**
     * /register - POST, register 
     * parameters:
     *  - id: user id 
     *  - name: name user
     *  - surname: surname
     *  - age: age of user
     *  - nickname: user nickname, unique field 
     *  - email: email validation, unique field
     *  - password: password of user
     * return jwt token
     */
    router.post('/register', async (_req: Request, res: Response, _next: NextFunction) => {
        try {

            if (!_req.query.nickName || !_req.query.password || !isValidEmail(_req.query.email.toString())) {
                return res.status(400).json({ msg: res.locals.localization.invalidCredentials });
            }

            const role = ROLE.USER;

            const userCheckUniqueEmail = await User.findOne({ where: { email: _req.query.email } });
            if (userCheckUniqueEmail) {
                return res.status(400).json({ msg: res.locals.localization.userEmailUsed });
            }

            const userCheckUniqueNickName = await User.findOne({ where: { nickName: _req.query.nickName } });
            if (userCheckUniqueNickName) {
                return res.status(400).json({ msg: res.locals.localization.userNicknameUsed });
            }
            // added crypto for demonstrate creating hash, in real project is better to use sha-256 or something
            const password = crypto.createHash('md5').update(_req.query.password.toString()).digest('hex');

            const newUser = await User.create(
                {
                    name: _req.query.name,
                    surname: _req.query.surname,
                    nickName: _req.query.nickName,
                    email: _req.query.email,
                    age: _req.query.age,
                    role: role,
                    password: password,
                }
            )
            const payload = { user: { id: newUser.id, name: newUser.nickName } };

            jwt.sign(payload, 'testket', { expiresIn: '1h' }, (err, token) => {
                if (err) throw err;
                res.json({ token });
            });
        } catch (error) {
            res.status(500).send(res.locals.localization.serverError);
        }
    })
    return router
}
