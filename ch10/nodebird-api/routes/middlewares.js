const { reset } = require("nodemon");
const jwt = require('jsonwebtoken')
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