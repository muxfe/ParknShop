/*
 * 管理员功能
 * Author: x-web
 * Date: 5/10/2015
 */

var express = require('express');
var url = require('url');
var crypto = require('crypto');

var router = express.Router();

// 管理员对象
var AdminUser = require('../models/AdminUser');
// 用户对象
var User = require('../models/User');
// 系统日志对象
var SystemLog = require('../models/SystemLog');
// 数据库操作对象
var Db = require('../models/db/Db');
// 站点配置
var settings = require('../models/db/settings');
// 管理员工具
var AdminUtils = require('../utils/adminUtils');


router.get( '/login', function ( req, res, next ) {
	res.render('manage/adminLogin', AdminUtils.getSiteInfo());
});

router.get( '/logout', function ( req, res, next ) {
	var username = req.session.adminUserInfo.username;

	req.session.adminlogined = false;
	req.session.adminUserInfo = null;

	// loged
	AdminUtils.saveSystemLog( 'logout', username + " logout." );

	res.redirect('/admin/login');
});

router.post( '/login', function ( req, res, next ) {
	var username = req.body.username,
		password = req.body.password,
		encryptedPwd = Db.encrypt(password, settings.encrypt_key);

	AdminUser.findOne( { username: username, password: encryptedPwd }, function ( err, user ) {
		if ( user ) {
			req.session.adminlogined = true;
			req.session.adminUserInfo = user;

			// loged
			AdminUtils.saveSystemLog( 'login', user.username + " logined from " + AdminUtils.getClientIp(req) );

			res.end('success');
		} else {
			console.log("Login failed.");
			res.end("error");
		}
	});
});

// 后台主页
router.get( '/', function ( req, res, next ) {
	res.render('manage/main', AdminUtils.getPageInfo( req, res, settings.SYSTEM_MANAGE ) );
});

router.get( '/manage/adminUsers', function ( req, res, next ) {
	res.render('manage/adminUsers', AdminUtils.getPageInfo( req, res, settings.ADMIN_USER_LIST, '/admin/manage/adminUsers' ));
});

/* api */
// 获取后台主页信息
router.get( '/api/v1/user_count', function ( req, res, next ) {
	res.json({
		adminCount: AdminUser.find().count(),
		customerCount: User.find( { group: 'customer' } ).count(),
		shopOwnerCount: User.find( { group: 'shop_owner' } ).count()
	});
});

// 获取系统日志
router.get( '/api/v1/system_logs', function ( req, res, next ) {
	var query = url.parse( req.url, true ).query,
		limit = query.limit || 5;

	if ( settings.debug ) {
		console.log( req.url + ' limit:' + limit );
	}

	SystemLog.find().sort( { date: -1 } ).limit( limit ).exec( function ( err, result ) {
		if ( result ) {
			res.json( result );
		} else {
			console.error( err );
			res.end('error');
		}
	});
});

module.exports = router;
