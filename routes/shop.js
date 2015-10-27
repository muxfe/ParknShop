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


module.exports = router;
