// passport-config.ts
import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import crypto from 'crypto';
import { models } from '../db/index';

const {
	User
} = models

passport.use(
  new LocalStrategy({ usernameField: 'email' }, async (email:string, password:string, done:any) => {
    try {
      const user = await User.findOne({ where: { email: email } });

      if (!user) {
        return done(null, false, { message: 'Invalid Credentials' });
      }

      const passwordCrypto = crypto.createHash('md5').update(password).digest('hex');

      if (passwordCrypto !== user.password) {
        return done(null, false, { message: 'Invalid Credentials' });
      }

      return done(null, user);
    } catch (error) {
      return done(error);
    }
  })
);

passport.serializeUser((user: any, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id: number, done) => {
  try {
    const user = await User.findByPk(id);
    done(null, user);
  } catch (error) {
    done(error);
  }
});

export default passport;
