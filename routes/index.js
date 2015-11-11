/*
 * 公共页面路由
 * Author: x-web
 * Date: 5/10/2015
 */

var express = require('express'),
	router = express.Router(),
	url = require('url'),
	SiteUtils = require('../utils/SiteUtils');

// Model
var Shop = require('../models/Shop'),
    Product = require('../models/Product'),
    User = require('../models/User'),
    Category = require('../models/Category')
    Ad = require('../models/Ad');


router.get('/', function (req, res, next) {
	res.render('front/index', SiteUtils.getData4Index(req, res, 'Main Page'));
});

/*
 * Product Detail Page
 * @param: product_id
 */
router.get('/product/:product_id', function (req, res, next) {
	var product_id = req.params.product_id;
	res.render('front/product', SiteUtils.getData4Product(req, res, product_id, 'Product Detail'));
	SiteUtils.incVisits(Product, product_id);
});

/*
 * Shop Home Page
 * @param: shop_id
 */
router.get('/shop/:shop_id', function (req, res, next) {
	var shop_id = req.params.shop_id;
	res.render('front/shop', SiteUtils.getData4Shop(req, res, shop_id, 'Shop Detail'));
	SiteUtils.incVisits(Shop, shop_id);
});

/*
 * Search result
 * @param: keyword
 * @query: in (product | shop)
 */
router.get('/search', function (req, res, next) {
	var stype = req.params.stype,
		query = url.parse(req.url, true).query,
		stype = query.stype || 'commodity',
		keyword = query.keyword || '';

	res.render('front/search', SiteUtils.getData4Search(req, res, stype, keyword, 'Search Result'));
});

router.get('/category/:cate_name?', function (req, res, next) {
	res.render('/front/category', SiteUtils.getPageInfos('Category'));
});


module.exports = router;
