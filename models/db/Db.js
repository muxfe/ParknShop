/*
 * 数据库操作类
 * Author: x-web
 * Date: 5/10/2015
 */

var url = require('url'),
	crypto = require('crypto'),
	mongoose = require('mongoose'),
	settings = require('./settings'),
	AdminUtils = require('../../utils/AdminUtils');

var db = mongoose.connect(settings.URL);
/* 数据库需要安全认证时，用下面的连接 */
// mongoose.connect('mongodb://' + settings.USERNAME + ':' + settings.PASSWORD + '@'+settings.HOST + ':'+settings.PORT + '/' + settings.DB + '');

var Db = {

	delete: function ( id, obj, req, res, logMsg) {
		obj.remove({ _id: id }, function (err, result) {
			if (err) {
				res.end(err);
			} else {
				console.log(logMsg + ' success!');
				AdminUtils.saveSystemLog( 'delete', logMsg );
				res.end('success');
			}
		});
	},

	findAll: function (obj, req, res, logMsg) {
		obj.find({}, function (err, result) {
			if (err) {
				res.next(err);
			} else {
				console.log(logMsg + ' success!');
				return res.json(result);
			}
		});
	},

	findOne: function ( id, obj, req, res, logMsg) {
		obj.findOne({ _id: id }, function (err, result) {
			if (err) {
				res.next(err);
			} else {
				console.log(logMsg + ' success!');
				return res.json(result);
			}
		});
	},

	updateOneById: function (id, obj, req, res, logMsg) {
		req.body.updateDate = new Date();
		var update = { $set: req.body };
		obj.update({ _id: id }, update, function (err) {
			if (err) {
				res.end(err);
			} else {
				console.log(logMsg + ' success!');
				AdminUtils.saveSystemLog( 'update', logMsg );
				res.end('success');
			}
		});
	},

	addOne: function (obj, req, res, logMsg) {
		var newObj = new obj(req.body);
		newObj.save(function (err) {
			if (err) {
				res.end(err);
			} else {
				console.log(logMsg + ' success!');
				AdminUtils.saveSystemLog( 'insert', logMsg );
				res.end('success');
			}
		});
	},

	pagination: function (obj, req, res, conditions) {
		var params = url.parse(req.url, true),
			startNum = (params.query.currentPage - 1) * params.query.limit + 1,
			currentPage = Number(params.query.currentPage),
			limit = Number(params.query.limit),
			pageInfo = null;

		startNum = isNaN(startNum) ? 0 : startNum;
		limit = isNaN(limit) ? 10 : limit;
		currentPage = isNaN(currentPage) ? 1 : currentPage;

		var query = null;
		if (conditions && conditions.length > 1 ) {
			query = obj.find().or(conditions);
		} else if (conditions) {
			query = obj.find(conditions[0]);
		} else {
			query = obj.find({});
		}

		query.sort({ "date": -1 });
		query.exec(function (err, docs) {
			if (err) {
				console.error(err);
			} else {
				pageInfo = {
					"totalItems": docs.length,
					"currentPage": currentPage,
					"limit": limit,
					"startNum": Number(startNum)
				};
				return res.json({
					docs: docs.slice(startNum - 1, startNum + limit - 1),
					pageInfo: pageInfo
				});
			}
		});
	},

	getPaginationResult: function (obj, req, res, q, filed) {
		var searchKey = req.query.searchKey,
			page = parseInt(req.query.page),
			limit = parseInt(req.query.limit);

		if (!page) {
			page = 1;
		}
		if (!limit) {
			limit = 15;
		}

		var order = req.query.order,
			sq = {},
			Str = '',
			A = 'problemID',
			B = 'asc';

		if (order) {
			Str = order.split('_');
			A = Str[0];
			B = Str[1];
			sq[A] = B;
		} else {
			sq.date = -1;
		}

		var startNum = (page - 1) * limit,
			resultList = null,
			resultNum = 0;

		if (q && q.length > 1) {
			resultList = obj.find().or(q, filed).sort(sq).skip(startNum).limit(limit);
			resultNum = obj.find().or(q, filed).count();
		} else {
			resultList = obj.find(q, filed).sort(sq).skip(startNum).limit(limit);
			resultNum = obj.find(q, filed).count();
		}

		var datasInfo = {
			docs: resultList,
			pageInfo: {
				"totalItems": resultNum,
				"currentPage": page,
				"limit": limit,
				"startNum": startNum,
				"searchKey": searchKey
			}
		};

		return datasInfo;
	},

	getDatasByParam: function (obj, req, res, q) {
		var order = req.query.order,
			limit = parseInt(req.query.limit),
			sq = {},
			Str = '',
			A = 'problemID',
			B = 'asc';

		if (order) {
			Str = order.split('_');
			A = Str[0];
			B = Str[1];
			sq[A] = B;
		} else {
			sq.date = -1;
		}

		if (!limit) {
			return obj.find(q).sort(sq);
		}

		return obj.find(q).sort(sq).skip(0).limit(limit);
	},

	getKeyArrayByTokenId: function (tokenId) {
		return Db.decrypt(tokenId, settings.encrypt_key).split('$');
	},

	getCount: function (obj, req, res, conditions) {
		obj.count(coditions, function (err, count) {
			if (err) {
				console.error(err);
			} else {
				return res.json({
					count: count
				});
			}
		});
	},

	encrypt: function (data, key) {
		var cipher = crypto.createCipher("bf", key);
		var newPwd = '';
		newPwd += cipher.update(data, "utf8", "hex");
		newPwd += cipher.final("hex");

		return newPwd;
	},

	decrypt: function (data, key) {
		var decipher = crypto.createDecipher("bf", key);
		var oldPwd = '';
		oldPwd += decipher.update(data, "hex", "utf8");
		oldPwd += decipher.final("utf8");

		return oldPwd;
	}

};

module.exports = Db;
