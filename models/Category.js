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
    // 名称
    name: String,
    // 目录连接
    url: {
        type: String,
        default: ''
    },
    keywords: String,
    description: String,
    date: {
        type: Date,
        default: Date.now
    },
    // 是否公开
    state: {
        type: Boolean,
        default: true
    },
    // 排序
    sortId: {
        type: Number,
        default: 1
    },
    // 子目录列表
    childIds: [ String ],
    // 父目录列表，
    parentId: {
        type: String,
        default: '0'
    },
    childs: [ ]
});

var Category = mongoose.model('Category', category);

module.exports = Category;
