/*
 * 公共页面路由
 * Author: x-web
 * Date: 5/10/2015
 */

var express = require('express'),
	router = express.Router(),
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

});

/*
 * Search result
 * @param: keyword
 * @query: in (product | shop)
 */
router.get('/search/:keyword', function (req, res, next) {

});


module.exports = router;
