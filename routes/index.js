/*
 * 公共页面路由
 * Author: x-web
 * Date: 5/10/2015
 */

var express = require('express'),
	router = express.Router(),
	SiteUtils = require('../utils/SiteUtils');



router.get( '/', function (req, res, next) {
	res.render( 'front/index', SiteUtils.getData4Index( req, res, 'Main Page' ) );
})


module.exports = router;
