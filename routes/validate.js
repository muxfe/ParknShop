/*
 * 登录验证
 * Author: x-web
 * Date: 8/10/2015
 */

var express = require('express'),
    router = express.Router(),
    settings = require('../models/db/settings'),
    User = require('../models/User');

// 用户登录权限验证
router.get( "/", function ( req, res, next ) {
    if ( req.session.user ) {
        req.session.logined = true;
        return next();
    }

    var auth_token = req.signedCookies[settings.auth_cookie_name];

    if ( !auth_token ) return next();

    var auth = auth_token.split('$$$$'),
        user_id = auth[0];

    User.findOne( { '_id': user_id }, function ( err, user ) {
        if ( user ) {
            req.session.user = user;
            req.session.logined = true;
            next();
        } else {
            console.error(err);
        }
    });
});

router.get( /^\/user\/manage(\/\w+)?$/, function ( req, res, next ) {
    if ( req.session.logined ) {
        next();
    } else {
        res.redirect('/user/login');
    }
});

// 管理员权限验证
router.get( /^\/admin\/?(logout)?$/, function ( req, res, next ) {
    if ( req.session.adminlogined ) {
        next();
    } else {
        res.redirect('/admin/login');
    }
});

// 后台页面验证
router.get( /^\/admin\/manage(\/\w+)?$/, function ( req, res, next ) {
    if ( req.session.adminlogined ) {
        next();
    } else {
        res.redirect('/admin/login');
    }
});

router.get( /^\/admin\/manage\/users(\/\w+)?$/, function ( req, res, next ) {
    if ( req.session.adminlogined ) {
        next();
    } else {
        res.redirect('/admin/login');
    }
});

// api验证
router.all( /^\/admin\/api\/v[0-9]+\/\w+$/, function ( req, res, next ) {
    if ( settings.debug || req.session.adminlogined ) {
        next();
    } else {
        res.end('Permission Denied.');
    }
});

module.exports = router;
