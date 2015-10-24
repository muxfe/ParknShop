/*
 * API路由
 * Author: x-web
 * Date: 23/10/2015
 */

var express = require('express'),
	router = express.Router(),
    url = require('url');

// DB
var Db = require('../models/db/Db');
// settings
var settings = require('../models/db/settings');
// Model
var Shop = require('../models/Shop'),
    Product = require('../models/Product'),
    User = require('../models/User'),
    Message = require('../models/Message'),
    Category = require('../models/Category'),
    Order = require('../models/Order'),
    Ad = require('../models/Ad');
// 工具类
var	SiteUtils = require('../utils/SiteUtils'),
    Auth = require('../utils/Auth');

/*
 * PUT Shop
 * @pre-condition: must be logined
 * @data: name, contact, description, logo
 */
router.put('/v1/shop', function (req, res, next) {
    if ( Auth.isShopOwner(req) ) {
        res.end('You have applied.');
    } else if ( Auth.isCustomer(req) ) {
        Shop.findOne({ 'shop_owner._id': req.session.user._id }, function (err, shop) {
            if (shop) {
                res.end('Your application is approving, please wait a monment.');
            } else if (err) {
                console.log(err);
            } else {
                Shop.business.insert( req, res );
            }
        });
    } else {
        res.end('Permission Denied.');
    }
});

/*
 * GET Shop
 * @param: shop_id ( shortid | 'mine' )
 * @query: start, limit, current, keywords
 */
router.get('/v1/shop/:shop_id?', function (req, res, next) {
	var query = url.parse(req.url, true),
		shop_id = req.params.shop_id,
		keywords = query.keywords || '';

	if (shop_id) {
		if (shop_id === 'mine') { // 登录用户的店铺
			if (Auth.isLogin(req)) {
				Shop.business.findMine(req, res);
			} else {
				res.end('Permission Denied.');
			}
		} else { // 公开信息的店铺
			Shop.business.findOne(shop_id, req, res);
		}
	} else { // 店铺列表
		Shop.business.find(req, res, keywords);
	}
});

/*
 * POST Shop
 * @param: shop_id ( shortid )
 * @body: name, logo, description, contact[phoneNum | email | address]
 */
router.post('/v1/shop/:shop_id', function (req, res, next) {
	if (!Auth.isLogin(req)) {
		res.end('Permission Denied.');
		return;
	}
	var shop_id = req.params.shop_id;
	Shop.business.updateByUser(shop_id, req, res);
});

module.exports = router;
