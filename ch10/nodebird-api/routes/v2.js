const express = require('express');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const url = require('url');

const { verifyToken, apiLimiter } = require('./middlewares');
const { Domain, User, Post, Hashtag } = require('../models');

const router = express.Router();

// 모든 라우터에 적용 => 응답에 Access-Control-Allow-Origin 헤더가 추가됨
// ==> CORS(Cross-Origin Resource Sharing) 에러 안생김
// router.use(cors({
//     credentials: true // 다른 도메인간에 쿠키가 공유되게 함
// }));
// 위 코드랑 router.use(cors())); 랑 같음

router.use(async (req, res, next) => {
    const domain = await Domain.findOne({
        where: { host: url.parse(req.get('origin')).host }, // http나 https 같은 프로토콜을 뗴어낼때 url.parse 메서드 사용
    });
    if (domain) { // 호스트와 비밀키가 모두 일치할 때만 CORS를 허용
        cors({
            origin: req.get('origin'), // 허용할 도메인
            credentials: true,
        })(req, res, next);
    } else {
        next();
    }
});

router.post('/token', apiLimiter, async (req, res) => { // 토큰을 발급하는 라우터
    const { clientSecret } = req.body;
    try {
        const domain = await Domain.findOne({
            where: { clientSecret },
            include: {
                model: User,
                attributes: ['nick', 'id'],
            },
        });
        if (!domain) {
            return res.status(401).json({
                code: 401,
                message: '등록되지 않은 도메인입니다. 도메인을 먼저 등록하세요',
            });
        }
        const token = jwt.sign({ // 첫번째 인수 : 토큰의 내용       두번째 인수 : 토큰의 비밀 키        세번째 인수 : 토큰의 설정
            id: domain.User.id,
            nick: domain.User.nick,
        }, process.env.JWT_SECRET, {
            expiresIn: '1m', //유효기간인데 60 * 1000 로 ms 단위로 적어도 됨
            issuer: 'nodebird',
        });
        return res.json({
            code: 200,
            message: '토큰이 발급되었습니다.',
            token,
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({
            code: 500,
            message: 'Server error',
        });
    }
});

router.get('/test', verifyToken, apiLimiter, (req, res) => { // 토큰을 테스트해볼 수 있는 라우터
    res.json(req.decoded);
});

router.get('/posts/my', apiLimiter, verifyToken, (req, res) => {
    Post.findAll({ where: { userId: req.decoded.id } })
        .then((posts) => {
            console.log(posts);
            res.json({
                code: 200,
                payload: posts,
            });
        })
        .catch((err) => {
            console.error(err)
            return res.status(500).json({
                code: 500,
                message: '서버 에러',
            });
        });
});

router.get('/posts/hashtag/:title', verifyToken, apiLimiter, async (req, res) => {
    try {
        const hashtag = await Hashtag.findOne({ where: { title: req.params.title } });
        if (!hashtag) {
            return res.status(404).json({
                code: 404,
                message: '검색결과가 없습니다.',
            });
        }
        const posts = await hashtag.getPosts();
        return res.json({
            code: 200,
            payload: posts,
        })
    } catch (err) {
        console.error(err)
        return res.status(500).json({
            code: 500,
            message: '서버 에러',
        });
    }
})

module.exports = router;