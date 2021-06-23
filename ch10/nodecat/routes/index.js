const express = require('express');
const axios = require('axios');

const router = express.Router();
const URL = 'http://localhost:8002/v2';

axios.defaults.headers.origin = 'http://localhost:4000'; // origin 헤더 추가
const request = async (req, api) => {   // NodeBird API에 요청을 보내는 함수.
    try {
        if(!req.session.jwt) { // 세션에 토큰이 없으면 => clientSecret을 사용해서 토큰을 발급하는 요청을 보냄.
            const tokenResult = await axios.post(`${URL}/token`, {
                clientSecret: process.env.CLIENT_SECRET,
            });
            req.session.jwt = tokenResult.data.token;
        }
        return await axios.get(`${URL}${api}`, {
            headers: { authorization: req.session.jwt },
        });
    } catch(err) {
        if (err.response.status === 419){ // 토큰 만료시 토큰 재발급
            delete req.session.jwt;
            return request(req, api);
        }
        return error.response
    }
}

router.get('/mypost', async (req, res, next) => { // API를 사용해 자신이 작성한 post를 JSON 형식으로 가져옴
    try {
        const result = await request(req, '/posts/my');
        res.json(result.data);
    } catch(err) {
        console.error(err);
        next(err)
    }
});

router.get('/search/:hashtag', async (req, res, next) =>{ // API를 사용해 해시태그를 검색함
    try{
        const result = await request(
            req, `/posts/hashtag/${encodeURIComponent(req.params.hashtag)}`,
        );
        res.json(result.data);
    } catch(err) {
        if(err.code) {
            console.error(err);
            next(err)
        }
    }
})


router.get('/test', async (req, res, next) => { // 토큰인증과정을 테스트하는 라우터
    try {
        if (!req.session.jwt) { // 세션에 토큰이 없으면 토큰 발급 시도
            const tokenResult = await axios.post('http://localhost:8002/v1/token', {
                clientSecret: process.env.CLIENT_SECRET,
            });
            if (tokenResult.data && tokenResult.data.code === 200) { // 토큰 발급 성공
                req.session.jwt = tokenResult.data.token; // 세션에 토큰 저장
            } else { // 토큰 발급 실패
                return res.json(tokenResult.data); // 발급 실패 사유 응답
            }
        }
        // 발급받은 토큰 테스트
        const result = await axios.get('http://localhost:8002/v1/test', {
            headers: { authorization: req.session.jwt },
        });
        return res.json(result.data);
    } catch (error) {
        console.error(error);
        if (error.response.status === 419) { // 토큰 만료 시
            return res.json(error.response.data);
        }
        return next(error);
    }
});

router.get('/', (req, res) => {
    res.render('main', { key: process.env.CLIENT_SECRET });
});

module.exports = router;