const request = require('supertest')
const { sequence } = require('../models')
const app = require('../app')

//afterAll(테스트 끝난 후), beforeEach(각각 테스트 수행 전), afterEach(각 테스트 수행 후)
beforeAll(async () => { // 테스트를 실행하기 전에 수행됨
    await sequelize.sync(); // DB 테이블 생성
})


describe('POST /join', () => { 
    test('로그인 안했으면 가입', async (done) => {
        request(app)
            .post('/auth/join')
            .send({
                email: 'kim03208@naver.com',
                nick: 'hwan2',
                password: '1234',
            })
            .expect('Location', '/')
            .expect(302, done)
    })
})

describe('POST /login', () => {
    const agent = request.agent(app);
    beforeEach((done) =>{
        agent
            .post('/auth/login')
            .send({
                email: 'kim03208@naver.com',
                password: '1234',
            })
            .end(done);
    })

    test('이미 로그인했으면 redirect /', (done) => {
        const msg = encodeURIComponent('로그인한 상태임'); 
        agent
            .post('/auth/join')
            .send
        request(app)
            .post('/auth/login')
            .send({
                email: 'kim03208@naver.com',
                nick: 'hwan2',
                password: '1234',
            })
            .expect('Location', `/?error=${msg}`)
            .expect(302, done)
    })
})