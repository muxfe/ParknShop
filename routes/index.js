/*
 * 公共页面路由
 * Author: x-web
 * Date: 5/10/2015
 */

var express = require('express');
var router = express.Router();



router.get('/', function (req, res, next) {
	res.end('you are browsing the index page.');
})


module.exports = router;