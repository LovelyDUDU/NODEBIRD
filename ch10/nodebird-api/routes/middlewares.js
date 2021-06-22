const { reset } = require("nodemon");
const jwt = require('jsonwebtoken');
const RateLimit = require('express-rate-limit'); // 이렂ㅇ 기간 내에 API를 사용할 수 있는 횟수를 제한
//JWT : Jswon Web Token. JSON 형태로 데이터를 저장하는 토큰

exports.isLoggedIn = (req, res, next) => {
    if(req.isAuthenticated()) { // 로그인 유무 파악
        next();
    } else {
        res.status(403).send('로그인 필요')
    }
};

exports.isNotLoggedIn = (req, res, next) => {
    if(!req.isAuthenticated()) {
        next();
    } else {
        const message = encodeURIComponent('로그인한 상태입니다.');
        res.redirect(`/?error=${message}`);
    }
}

exports.verifyToken = (req, res, next) => {
    try {
        req.decoded = jwt.verify(req.headers.authorization, process.env.JWT_SECRET); // 요청헤더에 저장된 토큰을 사용함. 첫번째 인수로 토큰, 두번째 인수로 토큰의 비밀키 넣음
        return next(); // 인증 성공시 req.decoded에 저장됨. req.decoded를 통해 다음 미들웨어에서 토큰의 내용물 사용 가능.
    } catch (err) {
        if(err.name === 'TokenExpiredError') { // 유효 기간 초과
            return res.status(419).json({
                code: 419,
                message: '토큰이 만료되었습니다.',
            });
        }
        return res.status(401).json({
            code: 401,
            message: '유효하지 않은 토큰입니다.',
        });
    }
};

exports.apiLimiter = new RateLimit({ // 이 미들웨어를 라우터에 넣으면 라우터에 사용량 제한이 걸림
    windowMs: 60 * 1000, // 기준 시간 ==> 1m
    max: 1, // 허용횟수
    handler(req, res) {  // 제한초과시 콜백 함수
        res.status(this.statusCode).json({
            code:this.statusCode,
            message: '1분에 한번만 요청할 수 있음',
        });
    },
});

exports.deprecated = (req, res) => {
    res.status(410).json({
        code: 410,
        message: '새로운 버전이 나왔습니다. 새로운 버전을 사용하세요',
    });
}; 