const Sequelize = require('sequelize');

module.exports = class Domain extends Sequelize.Model {
    static init(sequelize) {
        return super.init({
            host: { // 인터넷 주소
                type: Sequelize.STRING(80),
                allowNull: false,
            },
            type: { // 도메인 종류
                type: Sequelize.ENUM('free', 'premium'),
                allowNull: false,
            },
            clientSecret: { // 클라이언트 비밀키
                type: Sequelize.UUID,
                allowNull: false,
            }
        }, {
            sequelize,
            timestamps: true,
            paranoid: true,
            mobileName: 'Domain',
            tableName: 'domains',
        });
    }

    static associate(db) {
        db.Domain.belongsTo(db.User); // 한 유저가 여러 도메인 소유 가능
    }
}