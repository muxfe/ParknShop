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
// 数据库操作对象
var Db = require('../models/db/Db');
// 站点配置
var settings = require('../models/db/settings');
// 管理员工具
var AdminUtils = require('../utils/adminUtils');


router.get('/', function (req, res, next) {
	res.render('manage/adminLogin', AdminUtils.getSiteInfo());
});

router.post('/doLogin', function (req, res, next) {
	var username = req.body.username,
		password = req.body.password,
		encryptedPwd = Db.encrypt(password, settings.encrypt_key);

	AdminUser.findOne({ username: username, password: encryptedPwd }, function (err, user) {
		if (user) {
			req.session.adminlogined = true;
			req.session.adminUserInfo = user;
			res.end('success');
		} else {
			console.log("Login failed.");
			res.end("error");
		}
	});
});

router.get('/logout', function (req, res, next) {
	req.session.adminlogined = false;
	req.session.adminUserInfo = '';
	res.redirect('/admin');
});

router.get('/manage', function (req, res, next) {
	res.render('manage/main', AdminUtils.getPageInfo(req, res, settings.SYSTEM_MANAGE));
});


/* manage/main */
router.get('/manage/main_info', function (req, res, next) {
	AdminUtiles.setMainInfo(req, res);
});

module.exports = router;
