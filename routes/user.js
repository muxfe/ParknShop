/*
 * 用户功能
 * Author: x-web
 * Date: 20/10/2015
 */

var express = require('express'),
    url = require('url'),
    crypto = require('crypto'),
    router = express.Router();

// 站点配置
var settings = require('../models/db/settings');
// 数据库操作对象
var Db = require('../models/db/Db');
// 用户对象
var User = require('../models/User');
// 分类对象
var Category = require('../models/Category');
// 产品对象
var Product = require('../models/Product');
// 订单对象
var Order = require('../models/Order');
// 店铺对象
var Shop = require('../models/Shop');

// 管理员工具
var SiteUtils = require('../utils/siteUtils');

router.get( '/login', function ( req, res, next ) {
    if ( req.session.logined ) {
        res.redirect('/');
    } else {
        res.render( 'front/login_register', SiteUtils.getData4User( req, res, 'Sign In' ) );
    }
});

router.get( '/logout', function ( req, res, next ) {
    req.session.logined = false;
    req.session.user = null;

    res.redirect('/');
});

router.get( '/forget', function ( req, res, next ) {

});

router.post( '/login', function ( req, res, next) {
    var username = req.body.username,
        password = req.body.password,
        encryptedPwd = Db.encrypt(password, settings.encrypt_key);

    User.findOne( { username: username, password: encryptedPwd }, function ( err, user ) {
        if ( user ) {
            req.session.logined = true;
            req.session.user = user;

            res.end( 'success' );
        } else {
            console.log( username + 'Login failed.' );
            res.end( 'Username or password is wrong.' );
        }
    });
});

router.put( '/', function ( req, res, next ) {

});

module.exports = router;
