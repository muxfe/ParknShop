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
    // 状态 approving | reject | approved
    state: {
        type: String,
        default: 'approving'
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
    approveDate: Date
});

var Shop = mongoose.model('Shop', shop);

Shop.business = {

    delete: function ( id, req, res ) {
        var Db = require('./db/Db');
        Db.delete( id, Shop, req, res, req.session.adminUserInfo.username + ' delete a shop(' + id + ')' );
    },

    insert: function ( req, res ) {
        var SiteUtils = require('../utils/SiteUtils')
        var shop = new Shop();
        shop.shop_owner = {
            _id: req.session.user._id,
            username: req.session.user.username
        };
        shop.contact = {
            email: req.body.email,
            phoneNum: req.body.phoneNum,
            address: req.body.address
        };
        shop.name = req.body.name;
        shop.logo = req.body.logo;
        shop.description = req.body.description;
        shop.save(function (err) {
            if (err) {
                console.log(err);
                return;
            }
            SiteUtils.saveMessage(req.session.user._id, 'system', 'System Notify', 'Your application submit successfully, please wait the administrator approve it.');
            SiteUtils.saveMessage('administrator', 'system', 'System Notify', req.session.user.username + ' apply to be a shop owner, please handle it.');
            res.end('success');
        });
    },

    update: function ( id, req, res ) {

    }
};

module.exports = Shop;
