# NodeBird 프로젝트 
-> Node.js 교과서의 9장에 나오는 SNS 서비스 만들기 실습

### package.json
```
"dependencies": {
    "bcrypt": "^5.0.1",
    "cookie-parser": "^1.4.5",
    "dotenv": "^10.0.0",
    "express": "^4.17.1",
    "express-session": "^1.17.2",
    "morgan": "^1.10.0",
    "multer": "^1.4.2",
    "mysql2": "^2.2.5",
    "nunjucks": "^3.2.3",               템플릿 엔진의 일종. 다른 템플릿 엔진으로 퍼그 등이 있음.
    "passport": "^0.4.1",
    "passport-kakao": "^1.0.1",
    "passport-local": "^1.0.0",
    "sequelize": "^6.6.2",              MySQL 작업을 쉽게할 수 있도록 도와주는 라이브러리
    "sequelize-cli": "^6.2.0"
  },
"devDependencies": {
    "nodemon": "^2.0.7"
  }
```
### app.js
express 서버 코드가 담김


### .gitignore
git에 올릴 때 제외할 파일들을 넣어놓음


### .env
설정값들을 넣어놓음
<br>

## node_modules


## config 
MySQL DB 접속 정보가 있음(실무에서는 이것도 .env에 넣던데)

## migrations

## models

## passport

## public

## routes

## views

## seeders

## uploads
