/*
 * 商品目录对象
 * Author: x-web
 * Date: 8/10/2015
 */

var mongoose = require('mongoose'),
    shortid = require('shortid'),
    Schema = mongoose.Schema;

var category = new Schema({
    _id: {
        type: String,
        unique: true,
        'default': shortid.generate
    },
    name: String,
    // 目录连接
    url: {
        type: String,
        default: ''
    },
    keywords: String,
    description: String,
    // 父目录
    parent: {
        _id: String,
        name: String,
        url: String
    },
    date: {
        type: Date,
        default: Date.now
    },
    // 是否有子目录
    isChild: Boolean,
    // 子目录列表
    childs: [ // 子目录
        String
    ]
});

var Category = mongoose.model('Category', category);

module.exports = Category;
