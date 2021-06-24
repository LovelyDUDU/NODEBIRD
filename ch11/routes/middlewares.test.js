test('1+1은 2입니다.', () => {
    expect(1+1).toEqual(2);
})

const { isLoggedIn, isNotLoggedIn } = require('./middlewares');

describe('isLoggedIn', () => { // describe는 테스트를 그룹화해주는 역할을 함.
    test('로그인이 되있으면 isLoggedIn이 next를 호출해야함', () => {
    });

    test('로그인이 되있지않으면 isLoggedIn이 에러를 응답해야함', () => {

    });
});

describe('isNotLoggedIn', () => {
    test('로그인이 되있지않으면 isNotLoggedIn이 next를 호출해야함', () => {
    });

    test('로그인이 되있으면 isNotLoggedIn이 에러를 응답해야함', () => {

    });
});