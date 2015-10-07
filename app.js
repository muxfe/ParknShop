/**
 * 应用模块
 * Author: x-web
 * Date: 4/10/2015
 */


/* 通用模块引入 */

// node必须
var express = require('express');
var path = require('path');

// parser
var cookieParser = require('cookie-parser');
var session = require('express-session');
var bodyParser = require('body-parser');

// 压缩
var compression = require('compression');

// 网站图标
var favicon = require('serve-favicon');

// 日志
var logger = require('morgan');

// 存储
var RedisStore = require('connect-redis')(session);

// 文件操作
var fs = require('fs');

// 时间格式化
var moment = require('moment');

// 模板引擎
var partials = require('express-partials');

/* 配置 */
var settings = require('./models/db/settings')

/* 路由 */
var routes = require('./routes/index');

// admin
var admin = require('./routes/admin');


/* 层次结构 */

var app = express();

// 压缩
app.use(compression());

// view engine
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(partials());

// logger and parser
app.use(logger('dev'));
app.use(bodyParser.json({ limit: '5mb' })); // 限制上传5MB
app.use(bodyParser.urlencoded({ extended: false, limit: '5mb' }));
app.use(cookieParser(settings.session_secret));

// 解决异步层次混乱问题
app.use(require('express-promise')());

app.use(session({
	secret: settings.session_secret
}));

app.use(function (req, res, next) {
	// for Administrator
	res.locals.adminlogined = req.session.adminlogined;
	res.locals.adminUserInfo = req.session.adminUserInfo;

	next();
});

app.get('/robots.txt', function (req, res, next) {
	var stream = fs.createReadStream('./robots.txt', { flag: 'r' });
	stream.pipe(res);
});

// 静态目录
app.use(express.static(path.join(__dirname, 'public')));


// 指定路由
app.use('/admin', admin);

app.use('/', routes);


// Not Found
app.use(function (req, res, next) {
	var err = new Error('Not Found');
	err.status = 404;
	console.log(err);
	res.end('Page Not Found!');
});


module.exports = app;
