import {
    Router,
    Request,
    Response,
    NextFunction
} from 'express'
import jwt from 'jsonwebtoken';
import passport from 'passport';

import { models } from '../db'
import { UserModel } from '../db/user';
import { ROLE } from '../utils/enums';
import { isValidEmail } from '../utils/regexpfunctions';
import crypto from 'crypto';

const router: Router = Router()

const {
    User
} = models

export default () => {
    router.get('/', async (_req: Request, res: Response, _next: NextFunction) => {
        const programs = await User.findAll()
        return res.json({
            data: programs,
            message: 'List of users'
        })
    })
    router.post('/login', (req: Request, res: Response, next: NextFunction) => {
        passport.authenticate('local', (err: any, user: UserModel, info: any) => {
            if (err) {
                return res.status(500).send('Server error');
            }
            if (!user) {
                return res.status(400).json({ msg: 'Invalid Credentials' });
            }

            req.logIn(user, (err) => {
                if (err) {
                    return res.status(500).send('Server error');
                }

                const payload = { user: { id: user.id, name: user.nickName } };

                jwt.sign(payload, 'secret-key', { expiresIn: '1h' }, (err, token) => {
                    if (err) throw err;
                    res.json({ token });
                });
            });
        })(req, res, next);
    });

    router.post('/register', async (_req: Request, res: Response, _next: NextFunction) => {
        try {
            
            if (!_req.query.nickName || !_req.query.password || !isValidEmail(_req.query.email.toString())) {
                return res.status(400).json({ msg: 'Invalid Credentials' });
            }
            
            const role = _req.query.role && Object.values(ROLE).includes(_req.query.role as ROLE) ? _req.query.role : ROLE.USER;
           
            const userCheckUniqueEmail = await User.findOne({ where: { email: _req.query.email } });
            if(userCheckUniqueEmail)
            {
                return res.status(400).json({ msg: 'This email is already used' });
            }

            const userCheckUniqueNickName = await User.findOne({ where: { nickName: _req.query.nickName } });
            if(userCheckUniqueNickName)
            {
                return res.status(400).json({ msg: 'This nickname is already used' });
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

            jwt.sign(payload, 'secret-key', { expiresIn: '1h' }, (err, token) => {
                if (err) throw err;
                res.json({ token });
            });
        } catch (error) {
            res.status(500).send('Server error');
        }
    })
    // Защита маршрутов с использованием Passport.js и JWT
    router.get('/protected-route', passport.authenticate('jwt', { session: false }), (req, res) => {
        // Защищенный маршрут доступен только аутентифицированным пользователям с действительным JWT
        res.json({ message: 'Protected Route' });
    });

    return router
}
