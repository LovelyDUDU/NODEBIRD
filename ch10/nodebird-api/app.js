const express = require('express');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const path = require('path');
const session = require('express-session');
const nunjucks = require('nunjucks');
const dotenv = require('dotenv');
const passport = require('passport');

dotenv.config();
const authRouter = require('./routes/auth');
const indexRouter = require('./routes');


const { sequelize } = require('./models'); // Sequelize는 MySQL작업을 쉽게할 수 있게 해줌. (ORM으로 분류됨)
const passportConfig = require('./passport');
// 폴더내의 index.js는 require할때 생략 가능함. 즉 ./models는 ./models/index.js와 같음

const app = express();
passportConfig(); // 패스포트 설정

app.set('port', process.env.PORT || 8002);

app.set('view engine', 'html'); // 어떤 종류의 템플릿 엔진을 사용할지. .html이 아니라 .njk로 사용할 시 njk로 수정
nunjucks.configure('views', { // 템플릿 파일들이 위치한 폴더(views)를 지정함. 
    express: app, // express속성에 app객체 연결
    watch: true, // true이면 HTMl 파일이 변경될때 템플릿 엔진을 다시 렌더링해줌.
});

// 모델과 서버 연결
sequelize.sync({ force:false }) // sync 메서드를 이용해서 서버 실행시 MySQL과 연동됨. force가 true면 서버 실행신마다 테이블을 재생성함
    .then(() => {
        console.log('Success DB Connection');
    })
    .catch((err) => {
        console.error(err);
    });

// app.use(미들웨어) 주소를 첫번째 인수로 안넣으면 모든 요첨에서 실행됨. 주소를 넣으면 해당하는 요청에서만 실행됨
app.use(morgan('dev')); // req과 res에 대한 정보를 콘솔에 기록함.
app.use(express.static((path.join(__dirname, 'public')))); // static 미들웨어는 정적인 파일들을 제공하는 라우터 역할을 함.
app.use(express.json())
app.use(express.urlencoded({ extended: false}));
app.use(cookieParser(process.env.COOKIE_SECRET)); // req에 있는 쿠키를 해석해서 req.cookies로 만듬

// session 관리용 미들웨어.
app.use(session({ 
    resave: false, // 요청이 올 때 세션에 수정 사항이 안생겨도 세션을 다시 저장할지 설정
    saveUninitialized: false, // 세선에 저장할 내역이 없더라도 처음부터 세션을 생성할지 설정
    secret: process.env.COOKIE_SECRET,
    cookie: {
        httpOnly: true, // true면 클라이언트에서 쿠키 확인 못함.
        secure: false,
    }
}));
app.use(passport.initialize()); // 이 미들웨어는 req객체에 passport 설정을 심음
app.use(passport.session()); // 이 미들웨어는 req.session 객체에 passport 정보를 저장

app.use('/', indexRouter);
app.use('/auth', authRouter);

app.use((req, res, next) => {
    const error = new Error(`${req.method} ${req.url} 라우터가 없습니다.`);
    error.status = 404;
    next(error);
});

app.use((err, req, res, next) => { // 에러처리 미들웨어
    res.locals.message = err.message;
    res.locals.error = process.env.NODE_ENV !== 'production' ? err : {};
    res.status(err.status || 500);
    res.render('error');
});

app.listen(app.get('port'), () => { // 포트설정
    console.log(`server on! http://localhost:${app.get('port')}`)
})