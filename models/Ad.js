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
    // 权值
    sortId: {
        type: Number,
        default: 100
    },
    // 外链
    url: String,
    // 图片
    logo: String,
    // 是否置顶, admin操作
    isTop: {
        type: Boolean,
        default: false
    },
    // create Date
    date: {
        type: Date,
        default: Date.now
    },
    // 广告状态：true/false
    state: {
        type: Boolean,
        default: true
    },
    // 广告类型：product/shop/slide/brand
    type: {
        type: String,
        default: 'shop'
    },
    shop: {
        _id: String,
        shop_owner_id: String,
        shop_owner_username: String
    },
    // if type = 'product'
    product_id: String,
    startDate: {
        type: Date,
        default: Date.now
    },
    // 到期日期
    endDate: Date,
    // price
    price: {
        type: Number,
        default: 500 // 500/month shop
    }
});

var Ad = mongoose.model('Ad', ad);

Ad.business = {

    query: function (req, res) {
        var query = url.parse(req.url, true).query,
            // keywords = query.searchKey || '',
            shop = query.shop,
            // re = new RegExp( keywords, 'i' ),
            Db = require('./db/Db'),
            Auth = require('../utils/Auth'),
            conditions = {};

        if (shop && Auth.isShopOwner(req)) {
            conditions = { 'shop.shop_owner_id': shop ? req.session.user._id : null };
        } else if (Auth.isAdminLogin(req)) {
            conditions = {};
        } else {
            res.end("Permission Denied.");
        }

        Db.pagination(Ad, req, res, [conditions]);
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

    find: function (req, res) {
        var query = url.parse(req.url, true).query,
            type = query.type || 'product',
            now = new Date(),
            settings = require('./db/settings'),
            limit = settings.AD_LIMIT[type] || 0;

        Ad.find({ type: type, endDate: { $gte: now }, state: true })
            .limit(limit)
            .exec(function (err, result) {
                if (err) {
                    console.log(err);
                    res.end('errror');
                } else {
                    res.json(result);
                }
            });
    },

    insert: function (req, res) {
        res.end('bad call');
    },

    insertByUser: function (req, res) {
        var Db = require('./db/Db'),
            settings = require("./db/settings"),
            type = req.body.type || 'product',
            limit = settings.AD_LIMIT[type] || 2,
            price = settings.AD_PRICE[type] || 1000;
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
                    shop_owner_username: shop.shop_owner.username
                }
                req.body.endDate = new Date(new Date().getTime() + 30 * 24 * 3600 * 1000).toISOString();
                req.body.price = price;
                Ad.count({ type: type, state: true, endDate: { $gte: new Date() } }, function (err, count) {
                    if (err) {
                        console.log(err);
                        res.end('error');
                    } else {
                        if (count < limit) {
                            Db.addOne(Ad, req, res);
                        } else {
                            res.end("No Ad Position is valid.");
                        }
                    }
                });
			} else {
				res.end('You dont have a shop.');
			}
		});
    },

    update: function (id, req, res) {
        var Db = require('./db/Db');
        var username = req.session.adminUserInfo.username;
        Db.updateOneById( id, Ad, req, res, username + ' update the Ad(' + id + ')' );
    },

    updateByUser: function (id, req, res) {
        Ad.update({ _id: id, 'shop.shop_owner_id': req.session.user._id }, { $set: req.body }, function (err) {
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
        } else {
        // } else if (Auth.isShopOwner(req)) {
        //     Ad.remove({ _id: id, 'shop.shop_owner_id': req.session.user._id }, function (err) {
        //         if (err) {
        //             console.log(err);
        //             res.end('error');
        //         } else {
        //             res.end('success');
        //         }
        //     });
        // } else {
            res.end("Permission Denied.");
        }
    },

    countIncome: function (req, res) {
        var Auth = require('../utils/Auth'),
            query = url.parse(req.url, true).query,
            shop_id = query.shop_id,
            groupDate = query.groupDate,
            role = query.role || '',
            startDate = new Date(query.startDate),
            endDate = new Date(query.endDate),
            match = {},
            group = {};

        if (role && role === 'shop') {
            if (!shop_id) {
                res.end('Not a shop.');
                return;
            }
            match['shop._id'] = shop_id;
            match['shop.shop_owner_id'] = req.session.user._id;
        } else if (Auth.isAdminLogin(req)) {
            // next
        } else {
            res.end('Permission Denied.');
            return;
        }

        if (!isNaN(startDate.valueOf()) || !isNaN(endDate.valueOf())) {
            var condDate = {};
            if (!isNaN(startDate.valueOf())) {
                condDate.$gte = startDate;
            }
            if (!isNaN(endDate.valueOf())) {
                condDate.$lte = endDate;
            }
            match.date = condDate;
        }

        var id = null;
        if (groupDate) {
            countDateKey = '$date';
            switch (groupDate) {
                case 'daily':
                    id = { month: { $month: countDateKey }, day: { $dayOfMonth: countDateKey }, year: { $year: countDateKey } };
                    break;
                case 'weekly':
                    id = { week: { $week: countDateKey }, month: { $month: countDateKey }, year: { $year: countDateKey } };
                    break;
                case 'monthly':
                    id = { month: { $month: countDateKey }, year: { $year: countDateKey } };
                    break;
                case 'yearly':
                    id = { year: { $year: countDateKey } };
                    break;
                default:
                    id = { month: { $month: countDateKey }, day: { $dayOfMonth: countDateKey }, year: { $year: countDateKey } };
                    break;
            } // end-switch
        } // end-if-groupDate

        group = {
            _id: id,
            count: { $sum: 1 },
            totalPrice: { $sum: "$price" }
        };

        Ad.aggregate([
            {
                $match: match
            },
            {
                $group: group
            }
        ], function (err, result) {
            if (err) {
                res.end('error');
            } else {
                res.json(result);
            }
        });
    }

};

module.exports = Ad;
