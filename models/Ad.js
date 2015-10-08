/*
 * 广告对象
 * Author: x-web
 * Date: 8/10/2015
 */

 var mongoose = require('mongoose'),
     shortid = require('shortid'),
     Schema = mongoose.Schema;

var ad = new Schema({
    _id: {
        type: String,
        unique: true,
        'default': shortid.generate
    },
    title: String,
    content: String,
    url: String,
    image: {
        type: String,
        default: 'upload/images/default_ad.jpg'
    },
    // 权值
    value: Number,
    // 是否置顶
    isTop: Boolean,
    date: {
        type: Date,
        default: Date.now
    },
    // 广告状态：true/false
    state: {
        type: Boolean,
        default: true
    },
    // 广告类型：image/text
    type: {
        type: String,
        default: 'image'
    },
    valid_date: {
        start: Date,
        end: Date
    }
});

var Ad = mongoose.model('Ad', ad);

module.exports = Ad;
