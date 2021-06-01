const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt');

const User = require('../models/user');
module.exports = () => {
    passport.use(new LocalStrategy({
        usernameField: 'email',
        passwordField: 'password',
    }, async (email, password, done) => { // done은 passport.authenticate의 콜백함수
        try{
            const exUser = await User.findOne({ where: { email } });
            if (exUser) {
                const result = await bcrypt.compare(password, exUser.password);
                if (result) {
                    done(null, exUser);
                } else {
                    done(null, false, { message: '비밀번호 일치 안함.'});
                }
            } else {
                done(null, false, { message: '가입되지 않은 회원임.'});
            }
        } catch (err) {
            console.error(err);
            done(err);
        }
    }));
};