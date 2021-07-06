const mongoose = require('mongoose');

const { Schema } = mongoose;
const { Types: { ObjectId } } = Schema;
const chatSchema = new Schema({
    room: {  // 채팅방 아이디
        type: ObjectId,
        required: true,
        ref: 'Room',
    },
    user: { // 채팅한 사람
        type: String,
        required: true,
    },
    chat: String, // 채팅내역
    gif: String, // GIF 이미지 주소
    createdAt: { // 채팅시간
        type: Date,
        default: Date.now,
    },
});

module.exports = mongoose.model('Chat', chatSchema);