/*
 * 店铺功能
 * Author: x-web
 * Date: 27/10/2015
 */

var express = require('express'),
    url = require('url'),
    crypto = require('crypto'),
    router = express.Router();

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

// main page
router.get( '/manage', function ( req, res, next ) {
    res.render( 'front/shop_owner/main', SiteUtils.getData4ShopOwner( req, res, 'Main' ) );
});

// detail page
router.get( '/manage/detail', function ( req, res, next ) {
    res.render( 'front/shop_owner/detail', SiteUtils.getData4ShopOwner( req, res, 'Shop Detail' ) );
});

// product page
router.get( '/manage/product', function ( req, res, next ) {
    res.render( 'front/shop_owner/product', SiteUtils.getData4ShopOwner( req, res, 'Product Management' ) );
});

// order page
router.get( '/manage/order', function ( req, res, next ) {
    res.render( 'front/shop_owner/order', SiteUtils.getData4ShopOwner( req, res, 'Order Management' ) );
});

// category page
router.get( '/manage/category', function ( req, res, next ) {
    res.render( 'front/shop_owner/category', SiteUtils.getData4ShopOwner( req, res, 'Category Management' ) );
});

// income page
router.get( '/manage/income', function ( req, res, next ) {
    res.render( 'front/shop_owner/income', SiteUtils.getData4ShopOwner( req, res, 'Income Management' ) );
});

// sale_history page
router.get( '/manage/sale_history', function ( req, res, next ) {
    res.render( 'front/shop_owner/sale_history', SiteUtils.getData4ShopOwner( req, res, 'Sale History Management' ) );
});

// ad page
router.get( '/manage/ad', function ( req, res, next ) {
    res.render( 'front/shop_owner/ad', SiteUtils.getData4ShopOwner( req, res, 'Advertisement Management' ) );
});


module.exports = router;
