/*
 * 商铺对象
 * Author: x-web
 * Date: 8/10/2015
 */

 var mongoose = require('mongoose'),
     shortid = require('shortid'),
     Schema = mongoose.Schema;

var shop = new Schema({
    _id: {
        type: String,
        unique: true,
        'default': shortid.generate
    },
    // 店铺名称
    name: String,
    // 店主
    shop_owner: {
        _id: String,
        username: String
    },
    // 联系方式
    contact: {
        phoneNum: String,
        address: String,
        email: String,
    },
    // 店铺简介
    description: String,
    // 店铺LOGO
    logo: {
        type: String,
        default: '/upload/images/default_shop_logo.jpg'
    },
    // 访问量
    visits: {
        type: Number,
        default: 0
    },
    // 店铺评分
    score: {
        type: Number,
        default: 0
    },
    nProducts: {
        type: Number,
        default: 0
    },
    nSales: {
        type: Number,
        default: 0
    },
    date: {
        type: Date,
        default: Date.now
    },
    // 店铺自定义目录
    category: [
        new Schema({
            _id: {
                type: String,
                unique: true,
                'default': shortid.generate
            },
            name: String
        })
    ],
    // 店铺广告
    ads: [
        new Schema({
            title: String,
            url: String,
            image: {
                type: String,
                default: 'upload/images/default_shop_ad.jpg'
            }
        })
    ]
});

var Shop = mongoose.model('Shop', shop);

Shop.business = {

    delete: function ( id, req, res ) {
        var Db = require('./db/Db');
        Db.delete( id, Shop, req, res, req.session.adminUserInfo.username + ' delete a shop(' + id + ')' );
    }

};

module.exports = Shop;
