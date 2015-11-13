/*
 * 广告对象
 * Author: x-web
 * Date: 8/10/2015
 */

 var mongoose = require('mongoose'),
     shortid = require('shortid'),
     url = require('url'),
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
    logo: {
        type: String,
        default: 'upload/images/default_ad.jpg'
    },
    // 权值
    sortId: {
        type: Number,
        default: 0
    },
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
    // 广告类型：system/shop
    type: {
        type: String,
        default: 'shop'
    },
    shop: {
        _id: String,
        shop_owner_id: String,
        shop_owner_username: String
    },
    startDate: Date,
    endDate: Date,
    // price
    price: {
        type: Number,
        default: 1000
    }
});

var Ad = mongoose.model('Ad', ad);

function handleDate(req) {
    var startDate = new Date(req.body.startDate), endDate = new Date(req.body.endDate);
    if (isNaN(startDate.valueOf())) {
        startDate = new Date();
    }
    if (isNaN(endDate.valueOf())) {
        endDate = new Date();
        endDate.setDate(new Date(startDate).getDate() + 30);
    }
    req.body.startDate = startDate.toISOString();
    req.body.endDate = endDate.toISOString();
}

Ad.business = {

    query: function (req, res, shop) {
        var query = url.parse(req.url, true).query,
            keywords = query.searchKey || '',
            re = new RegExp( keywords, 'i' ),
            type = shop ? 'shop' : 'system',
            Db = require('./db/Db');

        var conditions = {
            type: type,
            'shop.shop_owner_id': shop ? req.session.user._id : null,
            $or: [
                { title: { $regex: re } },
                { content: { $regex: re } },
                { url: { $regex: re } }
            ]
        };
        var sort = { sortId: 1 };
        Db.pagination(Ad, req, res, conditions, sort);
    },

    findOne: function (id, req, res) {
        Ad.findOne({ _id: id }, function (err, result) {
            if (err) {
                console.log(err);
                res.end('error');
            } else {
                res.json(result);
            }
        });
    },

    insert: function (req, res) {
        var Db = require('./db/Db');
        var username = req.session.adminUserInfo.username;
        handleDate(req);
        req.body.type = 'system';
        Db.addOne(Ad, req, res, username + ' insert a advertisement.');
    },

    insertByUser: function (req, res) {
        var Db = require('./db/Db');
        Shop.findOne({ 'shop_owner._id': req.session.user._id }, function (err, shop) { // 验证店主
			if (err) {
				console.log(err);
				res.end('error');
				return;
			}
			if (shop) {
				req.body.shop = {
                    _id: shop._id,
                    shop_owner_id: shop.shop_owner._id,
                    shop_owner_username: shop.shop_owner._username
                }
                req.body.type = 'shop';
                handleDate(req);
                Db.addOne(Ad, req, res);
			} else {
				res.end('You dont have a shop.');
			}
		});
    },

    update: function (id, req, res) {
        var Db = require('./db/Db');
        var username = req.session.adminUserInfo.username;
        handleDate(req);
        Db.updateOneById( id, Ad, req, res, username + ' update the Ad(' + id + ')' );
    },

    updateByUser: function (id, req, res) {
        handleDate(req);
        Ad.update({ _id: id, 'shop.shop_owner_id': req.session.user._id, type: 'shop' }, { $set: req.body }, function (err) {
            if (err) {
                console.log(err);
                res.end('error');
            } else {
                res.end('success');
            }
        });
    },

    delete: function (id, req, res) {
        var Db = require('./db/Db'),
            Auth = require('../utils/Auth');

        if (Auth.isAdminLogin(req)) {
            Db.delete( id, Ad, req, res, req.session.adminUserInfo.username + ' delete the Ad(' + id + ')');
        } else if (Auth.isShopOwner(req)) {
            Ad.remove({ _id: id, 'shop.shop_owner_id': req.session.user._id }, function (err) {
                if (err) {
                    console.log(err);
                    res.end('error');
                } else {
                    res.end('success');
                }
            });
        } else {
            res.end("Permission Denied.");
        }
    }

};

module.exports = Ad;
