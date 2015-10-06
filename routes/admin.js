/*
 * 管理员功能
 * Author: x-web
 * Date: 5/10/2015
 */


var express = require('express');
var router = express.Router();
var url = require('url');

var crypto = require('crypto');

// 管理员对象
var AdminUser = require('../models/AdminUser');
// 数据库操作对象
var Db = require('../models/db/Db');
// 站点配置
var settings = require('../models/db/settings');


router.get('/', function (req, res, next) {
	res.render('manage/adminLogin', {
		title: settings.SITE_TITLE,
		description: 'ParknShop Management System Login'
	});
});


module.exports = router;
