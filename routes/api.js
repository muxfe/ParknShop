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

router.get('/v1/shop', function (req, res, next) {
    
});

module.exports = router;
