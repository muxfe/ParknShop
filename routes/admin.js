/*
 * 管理员功能
 * Author: x-web
 * Date: 5/10/2015
 */

var express = require('express');
var url = require('url');
var crypto = require('crypto');

var router = express.Router();

// 站点配置
var settings = require('../models/db/settings');
// 数据库操作对象
var Db = require('../models/db/Db');
// 管理员对象
var AdminUser = require('../models/AdminUser');
// 用户对象
var User = require('../models/User');
// 分类对象
var Category = require('../models/Category');
// 系统日志对象
var SystemLog = require('../models/SystemLog');

// 管理员工具
var AdminUtils = require('../utils/adminUtils');
// 系统工具
var system = require('../utils/system');


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

/* 后台主页 */
router.get( '/', function ( req, res, next ) {
	res.render('manage/main', AdminUtils.getPageInfo( req, res, settings.SYSTEM_MANAGE ) );
});

/* System Management */
router.get( '/manage/admin_user', function ( req, res, next ) {
	res.render('manage/adminUsers', AdminUtils.getPageInfo( req, res, settings.ADMIN_USER_LIST, '/admin/manage/adminUsers' ));
});

router.get( '/manage/system_log', function ( req, res, next ) {
	res.render('manage/systemLogs', AdminUtils.getPageInfo( req, res, settings.SYSTEM_LOGS, '/admin/manage/systemLogs' ));
});

router.get( '/manage/ad', function ( req, res, next ) {
	res.render('manage/ads', AdminUtils.getPageInfo( req, res, settings.ADS_LIST, '/admin/manage/ads' ));
});

router.get( '/manage/backup', function ( req, res, next ) {
	res.render('manage/backup', AdminUtils.getPageInfo( req, res, settings.BACKUP_MANAGE, '/admin/manage/backup' ));
});

router.put( '/manage/backup', function ( req, res, next ) {
	system.backup(req, res);
});

/* User Management */
router.get( '/manage/users/:group', function ( req, res, next ) {
	var group = req.params.group;
	if ( !group || 'shop_owner,customer,blacklist'.indexOf(group) < 0 ) {
		return next();
	}
	res.render('manage/users', AdminUtils.getPageInfo( req, res, settings.USER_MANAGE[group], '/admin/manage/users/' + group ));
});

/* Shop Management */
router.get( '/manage/shop', function (req, res, next) {
	res.render('manage/shops', AdminUtils.getPageInfo( req, res, settings.SHOP_MANAGE['shop'], '/admin/manage/shop' ));
});

router.get( '/manage/category', function (req, res, next) {
	res.render('manage/category', AdminUtils.getPageInfo( req, res, settings.SHOP_MANAGE['category'], '/admin/manage/category' ));
});

/* Sale Management */
router.get( '', function (req, res, next) {

});

/******************************************************************************/

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

// 获取对象信息
router.get( '/api/v1/:object_type/:_id?', function ( req, res, next ) {
	var params = url.parse( req.url, true ),
		object_type = req.params.object_type,
		_id = req.params._id,
		keywords = params.query.searchKey,
		target = AdminUtils.getTarget( object_type, keywords );

	if ( target ) {
		if ( _id ) {
			Db.findOne( _id, target.obj, req, res, 'find ' + _id );
		} else if ( target.obj.business.query ) {
			target.obj.business.query( req, res );
		} else {
			Db.pagination( target.obj, req, res, target.key );
		}
	} else {
		return next();
	}
});

// 添加对象信息
router.put( '/api/v1/:object_type', function ( req, res, next ) {
	var params = url.parse( req.url, true ),
		object_type = req.params.object_type,
		target = AdminUtils.getTarget( object_type );

	if ( target ) {
		target.obj.business.insert( req, res );
	} else {
		return next();
	}
});

// 修改对象信息
router.post( '/api/v1/:object_type/:_id?', function ( req, res, next ) {
	var params = url.parse( req.url, true ),
		object_type = req.params.object_type,
		_id = req.params._id,
		target = AdminUtils.getTarget( object_type );

	if ( target ) {
		target.obj.business.update( _id, req, res );
	} else {
		return next();
	}
});

// 删除对象信息
router.delete( '/api/v1/:object_type/:_id?', function ( req, res, next ) {
	var params = url.parse( req.url, true ),
		object_type = req.params.object_type,
		_id = req.params._id,
		target = AdminUtils.getTarget( object_type );

	if ( target ) {
		target.obj.business.delete( _id, req, res, target );
	} else {
		return next();
	}
});

module.exports = router;
