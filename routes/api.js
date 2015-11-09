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
    Ad = require('../models/Ad'),
	Commission = require('../models/Commission');
// 工具类
var	SiteUtils = require('../utils/SiteUtils'),
    Auth = require('../utils/Auth');


/* User Api */
/*
 * GET User
 */
router.get('/v1/user/:user_id', function (req, res, next) {
	var user_id = req.params.user_id,
		filter = '';
	if (user_id !== req.session.user._id) {
		filter = 'name username description logo';
	}
	User.findOne({ _id: user_id }, filter, function (err, user) {
		if (user) {
			res.json(user);
			return;
		}
		console.log('get ' + user_id + ' error!');
	});
});

/*
 * POST User
 * @pre-condition: must be logined
 */
router.post('/v1/user', function (req, res, next) {
	if (Auth.isLogin(req)) {
		User.business.updateByUser(req, res);
	} else {
		res.end('Permission Denied.');
	}
});

/* User Cart */
/*
 * POST User's Cart
 * @pre-condition: must be logined
 * @body: (product)_id, quantity
 */
router.post('/v1/user/cart', function (req, res, next) {
	if (Auth.isLogin(req)) {
		User.business.changeCart(req, res);
	} else {
		res.end('Permission Denied.');
	}
});

/*
 * DELETE User's Cart
 * @pre-condition: must be logined
 * @param: product_id
 */
router.delete('/v1/user/cart/:product_id', function (req, res, next) {
	var product_id = req.params.product_id;
	if (Auth.isLogin(req)) {
		User.business.deleteCart(product_id, req, res);
	} else {
		res.end('Permission Denied.');
	}
});

/* User Address */
/*
 * PUT User's Address
 * @pre-condition: must be logined
 * @body: name, postcode, address, phoneNum, isDefault
 */
router.put('/v1/user/address', function (req, res, next) {
	if (Auth.isLogin(req)) {
		User.business.insertAddr(req, res);
	} else {
		res.end('Permission Denied.');
	}
});

/*
 * POST User's Address
 * @pre-condition: must be logined
 * @param: addr_id
 * @body: name, postcode, address, phoneNum, isDefault
 */
router.post('/v1/user/address/:addr_id', function (req, res, next) {
	if (Auth.isLogin(req)) {
		var addr_id = req.params.addr_id;
		User.business.updateAddr(addr_id, req, res);
	} else {
		res.end('Permission Denied.');
	}
});

/*
 * DELETE User's Address
 * @pre-condition: must be logined
 * @param: addr_id
 */
router.delete('/v1/user/address/:addr_id', function (req, res, next) {
	if (Auth.isLogin(req)) {
		var addr_id = req.params.addr_id;
		User.business.deleteAddr(addr_id, req, res);
	} else {
		res.end('Permission Denied.');
	}
});


/* Shop Api */
/*
 * PUT Shop
 * @pre-condition: must be logined
 * @data: name, contact, description, logo
 */
router.put('/v1/shop', function (req, res, next) {
    if (Auth.isShopOwner(req)) {
        res.end('You have applied.');
    } else if (Auth.isCustomer(req)) {
        Shop.findOne({ 'shop_owner._id': req.session.user._id }, function (err, shop) {
            if (shop) {
                res.end('Your application is approving, please wait a monment.');
            } else if (err) {
                console.log(err);
            } else {
                Shop.business.insert(req, res);
            }
        });
    } else {
        res.end('Permission Denied.');
    }
});

/*
 * GET Shop
 * @param: shop_id ( shortid | 'mine' )
 * @query: limit, currentPage, keywords
 */
router.get('/v1/shop/:shop_id?', function (req, res, next) {
	var shop_id = req.params.shop_id;

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
		Shop.business.find(req, res);
	}
});

/*
 * POST Shop
 * @param: *shop_id ( shortid )
 * @body: name, logo, description, contact[phoneNum | email | address]
 */
router.post('/v1/shop/:shop_id', function (req, res, next) {
	if (Auth.isLogin(req)) {
		var shop_id = req.params.shop_id;
		Shop.business.updateByUser(shop_id, req, res);
	} else {
		res.end('Permission Denied.');
	}
});


/* Product Api */
/*
 * GET Product
 * @param: product_id
 */
router.get('/v1/product/:product_id?', function (req, res, next) {
	var product_id = req.params.product_id;
	if (product_id) {
		Product.business.findOne(product_id, req, res);
	} else {
		Product.business.find(req, res);
	}
});

/*
 * PUT Product
 * @body: name, category_id, shop_category_id, description, content, details, state, price, storage, images, tags
 */
router.put('/v1/product', function (req, res, next) {
	if (Auth.isShopOwner(req)) {
		Product.business.insert(req, res);
	} else {
		res.end('Permission Denied.');
	}
});

/*
 * POST Product
 * @params: product_id
 * @body: name, category_id, shop_category_id, description, content, details, state, price, storage, images, tags
 */
router.post('/v1/product/:product_id', function (req, res, next) {
	if (Auth.isShopOwner(req)) {
		var product_id = req.params.product_id;
		Product.business.update(product_id, req, res);
	} else {
		res.end('Permission Denied.');
	}
});

/*
 * DELETE Product
 * @params: product_id
 */
router.delete('/v1/product/:product_id', function (req, res, next) {
	if (Auth.isShopOwner(req)) {
		var product_id = req.params.product_id;
		Product.business.delete(product_id, req, res);
	} else {
		res.end('Permission Denied.');
	}
});


/* Order Api */
/*
 * GET Order
 * @param: order_id?
 */
router.get('/v1/order/:order_id?', function (req, res, next) {
	var order_id = req.params.order_id;
	if (order_id) {
		if (order_id === 'cart') {
			if (!Auth.isLogin(req)) {
				res.end('Permission Denied.');
			} else {
				Order.business.findCart(req, res);
			}
		} else {
			Order.business.findOne(order_id, req, res);
		}
	} else {
		Order.business.find(req, res);
	}
});

/*
 * PUT Order
 * @pre-condition: must be logined
 * @body: address(), products()
 */
router.put('/v1/order', function (req, res, next) {
	if (Auth.isLogin(req)) {
		Order.business.insert(req, res);
	} else {
		res.end('Permission Denied.');
	}
});

/*
 * POST Order
 * @pre-condition: must be shop_owner logined
 * @body:
 */
router.post('/v1/order/:order_id', function (req, res, next) {
	var order_id = req.params.order_id;
	if (Auth.isShopOwner(req)) {
		Order.business.update(order_id, req, res);
	} else {
		res.end('Permission Denied.');
	}
});

/*
 * DELETE Order
 * @pre-condition: must be logined
 * @customer: cancel order
 * @shop_owner: cancel order
 */
router.delete('/v1/order/:order_id', function (req, res, next) {
	var order_id = req.params.order_id;
	if (Auth.isLogin(req)) {
		Order.business.delete(req, res);
	} else {
		res.end('Permission Denied.');
	}
});


/* Category Api */
/*
 * GET Category
 * @query: shop_id
 */
router.get('/v1/category', function (req, res, next) {
	var query = url.parse(req.url, true).query;
		shop_id = query.shop_id,
		condition = {};
	if (shop_id) {
		condition.shop_id = shop_id;
		condition.type = 'shop';
	} else {
		condition.type = 'system';
	}
	Category.business.find(req, res, condition);
});

/*
 * POST Category
 * @param: *cate_id
 */
router.post('/v1/category/:cate_id', function (req, res, next) {
	var cate_id = req.params.cate_id;

	if (Auth.isShopOwner(req) && shop_id) {
		Shop.findOne({ 'shop_owner._id': req.session.user._id }, function (err, shop) { // 验证店主
			if (err) {
				console.log(err);
				res.end('error');
				return;
			}
			if (shop) {
				Category.business.update(cate_id, req, res);
			} else {
				res.end('You dont have a shop.');
			}
		});
	} else {
		res.end('Permission Denied.');
	}
});

/*
 * PUT Category
 */
router.put('/v1/category', function (req, res, next) {
	if (Auth.isShopOwner(req) && shop_id) {
		Shop.findOne({ 'shop_owner._id': req.session.user._id }, function (err, shop) { // 验证店主
			if (err) {
				console.log(err);
				res.end('error');
				return;
			}
			if (shop) {
				Category.business.insert(req, res);
			} else {
				res.end('You dont have a shop.');
			}
		});
	} else {
		res.end('Permission Denied.');
	}
});

/*
 * DELETE Category
 * @param: cate_id
 */
router.delete('/v1/category/:cate_id', function (req, res, next) {
	var cate_id = req.params.cate_id;

	if (Auth.isShopOwner(req)) {
		Shop.findOne({ 'shop_owner._id': req.session.user._id }, function (err, shop) { // 验证店主
			if (err) {
				console.log(err);
				res.end('error');
				return;
			}
			if (shop) {
				Category.business.delete(cate_id, req, res);
			} else {
				res.end('You dont have a shop.');
			}
		});
	} else {
		res.end('Permission Denied.');
	}
});

module.exports = router;
