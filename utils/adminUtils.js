/*
 * 管理员工具对象
 * Author: x-web
 * Date: 7/10/2015
 */

var url = require('url');

var settings = require('../models/db/settings');
var Db = require('../models/db/Db');

var AdminUser = require('../models/AdminUser');

var AdminUtils = {

    getSiteInfo: function (description) {
        return {
            title: settings.SITE_TITLE,
            description: description
        };
    },

    getClientIp: function (req) {
        return req.headers['x-forwarded-for'] ||
            req.connection.remoteAddress ||
            req.socket.remoteAddress ||
            req.connection.socket.remoteAddress;
    },

    setMainInfo: function (req, res) {
        return res.json({
            adminUserCount: AdminUser.count({})
        });
    },

    getPageInfo: function (req, res, module, currentLink) {
        var searchKey = '';

        if (req.url) {
            var params = url.parse(req.url, true);
            searchKey = params.query.searchKey;
        }

        return {
            siteInfo: AdminUtils.getSiteInfo(module[1]),
            bigCategory: module[0],
            searchKey: searchKey,
            currentLink: currentLink,
            layout: 'manage/public/adminTpl'
        };
    }


};

module.exports = AdminUtils;
