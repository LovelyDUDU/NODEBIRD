const { isLoggedIn, isNotLoggedIn } = require('./middlewares');

describe('isLoggedIn', () => { // describe는 테스트를 그룹화해주는 역할을 함.
    const res = { // 가짜 객체, 가짜 함수르 넣는 행위 : 모킹
        status: jest.fn(() => res),
        send: jest.fn()
    };
    const next = jest.fn();

    test('로그인이 되있으면 isLoggedIn이 next를 호출해야함', () => {
        const req = {
            isAuthenticated: jest.fn(() => true),
        };
        isLoggedIn(req, res, next);
        expect(next).toBeCalledTimes(1);
    });

    test('로그인이 되있지않으면 isLoggedIn이 에러를 응답해야함', () => {
        const req = {
            isAuthenticated: jest.fn(() => false),
        };
        isLoggedIn(req, res, next);
        expect(res.status).toBeCalledWith(403);
        expect(res.send).toBeCalledWith('로그인 필요');
    });
});

describe('isNotLoggedIn', () => {
    const res = { // 가짜 객체, 가짜 함수르 넣는 행위 : 모킹
        redirect: jest.fn()
    };
    const next = jest.fn();
    
    test('로그인이 되있지않으면 isNotLoggedIn이 next를 호출해야함', () => {
        const req = {
            isAuthenticated: jest.fn(() => true),
        };
        isNotLoggedIn(req, res, next);
        const message = encodeURIComponent('로그인한 상태입니다.');
        expect(res.redirect).toBeCalledWith(`/?error=${message}`);
    });

    test('로그인이 되있으면 isNotLoggedIn이 에러를 응답해야함', () => {
        const req = {
            isAuthenticated: jest.fn(() => false),
        };
        isNotLoggedIn(req, res, next);
        expect(next).toBeCalledTimes(1);
    });
});