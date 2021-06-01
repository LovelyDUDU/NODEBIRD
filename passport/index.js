const passport = require('passport');
const local = require('./localStrategy');
const kakao = require('./kakaoStrategy');
const User = require('../models/user');

module.exports = () => {
    passport.serializeUser((user, done) => { // serializeUser은 로그인시 실행됨. req.session 객체에 어떤 데이터를 저장할지 정함
        done(null, user.id); // done의 첫번째 인수는 에러발생시 사용, 두번째는 저장할 데이터
    });

    passport.deserializeUser((id, done) => { // deserializeUser은 매 요청시 실행됨.
        User.findOne({ where: { id }})
        .then(user => done(null, user))
        .catch(err => done(err));
    });

    local();
    kakao();
}