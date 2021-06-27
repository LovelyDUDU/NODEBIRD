const Sequelize = require('sequelize');

//사용자 정보를 저장하는 모델. 기본적으로 email, nickname, pw를 저장
module.exports = class User extends Sequelize.Model {
    static init(sequelize){
        return super.init({
            email: {
                type: Sequelize.STRING(40),
                allowNull: true,
                unique: true,
            },
            nick: {
                type: Sequelize.STRING(15),
                allowNull: false,
            },
            password: {
                type: Sequelize.STRING(100),
                allowNull: true,
            },
            provider: { // SNS 로그인을 했을 경우 저장 (local: 로컬로그인 / kakao: 카카오로그인)
                type: Sequelize.STRING(10),
                allowNull: false,
                defaultValue: 'local',
            },
            snsId: { // SNS 로그인을 했을 경우 저장
                type: Sequelize.STRING(30),
                allowNull: true,
            },
        }, {
            sequelize,
            timestamps: true, // createdAt, updatedAt, deletedAt 컬럼 추가
            underscored: false,
            modelName: 'User',
            tableName: 'users',
            paranoid: true, // createdAt, updatedAt, deletedAt 컬럼 추가
            charset: 'utf8',
            collate: 'utf8_general_ci',
        });
    }

    // User 모델과 Post 모델은 1: N 관계, User 모델끼리 M : N 관계
    static associate(db) {
        db.User.hasMany(db.Post);
        db.User.belongsToMany(db.User, {
            foreignKey: 'followingId', // foreignKey는 사용자 아이디를 구별하기 위함. 
            as: 'Followers', // as는 foreginKey와 반대되는 모델을 가리킴. 
            through: 'Follow',
        });
        db.User.belongsToMany(db.User, {
            foreignKey: 'followerId',
            as: 'Followings',
            through: 'Follow',
        });
    }
};