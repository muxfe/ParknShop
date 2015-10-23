/*
 * 留言管理
 * Author: x-web
 * Date: 23/10/2015
 */

var mongoose = require('mongoose'),
    shortid = require('shortid'),
    Schema = mongoose.Schema;

var message = new Schema({
    _id: {
        type: String,
        unique: true,
        'default': shortid.generate
    },
    // 消息类型
    type: {
        type: String,
        default: 'system'
    },
    date: {
        type: Date,
        default: Date.now
    },
    receiver_id: String,
    content: String,
    title: String,
    sender: String,
    // 是否已读
    isRead: {
        type: Boolean,
        default: false
    }
});

var Message = mongoose.model('Message', message);

module.exports = Message;
