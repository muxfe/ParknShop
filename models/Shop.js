/*
 * 商铺对象
 * Author: x-web
 * Date: 8/10/2015
 */

 var mongoose = require('mongoose'),
     shortid = require('shortid'),
     url = require('url'),
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
        default: 5
    },
    nProducts: {
        type: Number,
        default: 0
    },
    nSaled: {
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
            phoneNum: req.body['contact[phoneNum]'],
            address: req.body['contact[address]'],
            email: req.body['contact[email]']
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
        var state = req.body.state;

        Shop.update({ _id: id }, { $set: req.body }, function (err) {
            if (err) {
                console.log(err);
                return;
            }
            if (state === 'approved') {
                Shop.findOne({ _id: id }, function (err, shop) {
                    if (err) {
                        console.log(err);
                        return;
                    }
                    if (shop) {
                        var User = require('./User');
                        User.update({ _id: shop.shop_owner._id }, { $set: { group: 'shop_owner' } }, function (err) {
                            if (err) {
                                console.log(err);
                                return;
                            }
                            res.end('success');
                        })
                    } else {
                        res.end('error');
                    }
                });
            } else {
                res.end('success');
            }
        });
    },

    updateByUser: function ( id, req, res ) {
        if (req.session.user._id !== req.body['shop_owner[_id]']) {
            res.end('Permission Denied.');
            return;
        }
        var update = {
            name: req.body.name,
            contact: {
                phoneNum: req.body['contact[phoneNum]'],
                address: req.body['contact[address]'],
                email: req.body['contact[email]']
            },
            logo: req.body.logo,
            description: req.body.description
        };
        Shop.update({ _id: id, 'shop_owner._id': req.session.user._id }, { $set: update }, function (err) {
            if (err) {
                console.log(err);
                res.end('error');
                return;
            }
            res.end('success');
        });
    },

    findMine: function ( req, res ) {
        Shop.findOne({ 'shop_owner._id': req.session.user._id }, function (err, shop) {
            if (shop) {
                res.json(shop);
            } else if (err) {
                console.log(err);
                res.end('error');
            } else {
                res.end('You have no shop.');
            }
        });
    },

    findOne: function ( shop_id, req, res ) {
        var part = url.parse(req.url, true).query.part,
            filter = '';
        if (part) {
            filter = 'name shop_owner';
        }
        Shop.findOne({ _id: shop_id, state: 'approved' }, filter, function (err, shop) {
            if (err) {
                console.log(err);
                return;
            }
            if (shop) {
                res.json(shop);
            } else {
                res.end('Permission Denied.');
            }
        });
    },

    find: function ( req, res ) {
        var Db = require('./db/Db');
        var query = url.parse(req.url, true).query;
        var keywords = query.keywords,
            sortByVisits = query.sortByVisits || '',
            sortBySaled = query.sortBySaled || '',
            sortByProducts = query.sortByProducts || '',
            sortByScore = query.sortByScore || '';
        var re = new RegExp(keywords, 'i');
        var sort = {};

        if (sortByVisits === '1' || sortByVisits === '-1') {
            sort.visits = Number(sortByVisits);
        } else if (sortByScore === '1' || sortByScore === '-1') {
            sort.score = Number(sortByScore);
        } else if (sortBySaled === '1' || sortBySaled === '-1') {
            sort.nSaled = Number(sortBySaled);
        } else if (sortByProducts === '1' || sortByProducts === '-1') {
            sort.nProducts = Number(sortByProducts);
        } else {
            sort.date = -1;
        }

		Db.pagination(Shop, req, res, [{ // condtions
			'state': 'approved',
			$or: [
				{ 'description': { $regex: re } },
				{ 'name': { $regex: re } }
			]
		}], sort);
    }
};

module.exports = Shop;
