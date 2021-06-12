const express = require('express');
const { isLoggedIn, isNotLoggedIn } = require('./middlewares');
const { Post, User, Hashtag } = require('../models');

const router = express.Router();

router.use((req, res, next) => {                // 라우터용 미들웨어
    res.locals.user = req.user;                 // res.locals 로 값을 설정하는 이유 => 모든 템플릿 엔진에서 공통으로 사용하기 때문
    res.locals.followerCount = req.user ? req.user.Followers.length : 0;
    res.locals.followingCount = req.user ? req.user.Followings.length : 0;
    res.locals.followerIdList = req.user ? req.user.Followings.map(f => f.id) : [];
    next();
});

router.get('/profile', isLoggedIn, (req, res) => { // 프로필화면은 로그인이 된 상태에서만 허용 => isLoggedIn 사용
    res.render('profile', { title: '내 정보 - NodeBird ' });
});

router.get('/join', isNotLoggedIn, (req, res) => { // 회원가입 화면은 로그인이 되지 않은 상태에서만 허용 => isNotLoggedIn 사용
    res.render('join', { title: "회원가입 - NodeBird" });
});


router.get('/', async (req, res, next) => { // 메인화면 => 모든 게시물을 출력해줌(.findAll 사용)
    try {
        const posts = await Post.findAll({
            include: {
                model: User,
                attributes: ['id', 'nick'],
            },
            order: [['createdAt', 'DESC']],
        });
        res.render('main', {
            title: 'NodeBird',
            twits: posts,
        });
    } catch (err) {
        console.error(err);
        next(err);
    }
});

router.get('/hashtag', async (req, res, next) => { // 해시태그로 검색 화면 => req.query.hashtag로 값을 받은 후 검색
    const query = req.query.hashtag;
    if (!query) {
        return res.redirect('/');
    }
    try {
        const hashtag = await Hashtag.findOne({ where: { title: query } });
        let posts = [];
        if (hashtag) {
            posts = await hashtag.getPosts({ include: [{ model: User }] });
        }

        return res.render('main', {
            title: `${query} | NodeBird`,
            twits: posts,
        });
    } catch (err) {
        console.error(err);
        return next(err);
    }
});

router.get('/update_profile', isLoggedIn, async (req, res) => { // 프로필 수정 화면은 로그인이 된 상태에서만 허용 => isLoggedIn 사용
    try{
        const user = req.user
        const userInfo = await User.findOne({ where: { id: user.id }})
        if(userInfo.provider == "local"){
            res.render('update_profile', {
                title: '내 정보 수정 - NodeBird ',
                userProvider: userInfo.provider,
                userEmail: userInfo.email,
                userNickname: userInfo.nick
            });
        }
        else{
            res.render('update_profile', {
                title: '내 정보 수정 - NodeBird ',
                userProvider: userInfo.provider,
                userNickname: userInfo.nick
            });
        }
    }
    catch(err){
        console.error(err);
        return next(err);
    }
});

module.exports = router;