const passport = require('passport');
const local = require('./localStrategy');
const kakao = require('./kakaoStrategy');
const User = require('../models/user');

module.exports = () => {

    // 사용자 정보 객체를 세션에 저장함
    passport.serializeUser((user, done) => { // serializeUser은 로그인시 실행됨. req.session 객체에 어떤 데이터를 저장할지 정함
        done(null, user.id); // done의 첫번째 인수는 에러발생시 사용, 두번째는 저장할 데이터
    });

    // 세션에 저장한 아이디를 통해 사용자 정보 객체를 불러옴. 
    passport.deserializeUser((id, done) => { // deserializeUser은 매 요청시 실행됨.
        User.findOne({ 
            where: { id },
            include: [{
                model: User,
                attributes: ['id', 'nick'],
                as: 'Followers',
            }, {
                model: User, 
                attributes: ['id', 'nick'],
                as: 'Followings',
            }]
        })
        .then(user => done(null, user))
        .catch(err => done(err));
    });

    local();
    kakao();
}