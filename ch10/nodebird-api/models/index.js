const Sequelize = require('sequelize');
const env = process.env.NODE_ENV || 'development';
const config = require('../config/config')[env];
const User = require('./user');
const Post = require('./post');
const Hashtag = require('./hashtag');
const Domain = require('./domain');
const db = {};
const sequelize = new Sequelize( // Sequelize는 시퀼라이즈 패키지이자 생성자.
  config.database, config.username, config.password, config,
);

// 각 모델들을 시퀼라이즈 객체에 연결함.
db.sequelize = sequelize;
db.User = User;
db.Post = Post;
db.Hashtag = Hashtag;
db.Domain = Domain;

User.init(sequelize);
Post.init(sequelize);
Hashtag.init(sequelize);
Domain.init(sequelize);
User.associate(db);
Post.associate(db);
Hashtag.associate(db);
Domain.associate(db);
module.exports = db;
