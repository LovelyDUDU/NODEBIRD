const express = require('express');
const jwt = require('jsonwebtoken');

const { verifyToken } = require('./middlewares');
const { Domain, User, Post, Hashtag } = require('../models');

const router = express.Router();

router.post('/token', async (req, res) => { // 토큰을 발급하는 라우터
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

router.get('/test', verifyToken, (req, res) => { // 토큰을 테스트해볼 수 있는 라우터
    res.json(req.decoded);
});

router.get('/posts/my', verifyToken, (req, res) => {
    Post.findAll({ where: { userId: req.decoded.id} })
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
                code:500,
                message: '서버 에러',
            });
        });
});

router.get('/posts/hashtag/:title', verifyToken, async (req, res) => {
    try {
        const hashtag = await Hashtag.findOne({ where: { title: req.params.title } });
        if(!hashtag) {
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
    } catch(err) {
        console.error(err)
        return res.status(500).json({
            code:500,
            message: '서버 에러',
        });
    }
})

module.exports = router;