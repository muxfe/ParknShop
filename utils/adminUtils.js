/*
 * 管理员工具对象
 * Author: x-web
 * Date: 7/10/2015
 */

var url = require('url');

var settings = require('../models/db/settings'),
    AdminUser = require('../models/AdminUser'),
    SystemLog = require('../models/SystemLog'),
    DataLog = require('../models/DataLog')
    User = require('../models/User'),
    Shop = require('../models/Shop'),
    Order = require('../models/Order'),
    Product = require('../models/Product'),
    Category = require('../models/Category'),
    Ad = require('../models/Ad'),
    Commission = require('../models/Commission');

var AdminUtils = {

    getSiteInfo: function ( description ) {
        return {
            title: settings.SITE_TITLE,
            description: description
        };
    },

    getClientIp: function ( req ) {
        return req.headers['x-forwarded-for'] ||
            req.connection.remoteAddress ||
            req.socket.remoteAddress ||
            req.connection.socket.remoteAddress;
    },

    setMainInfo: function ( req, res ) {
        return res.json({
            adminUserCount: AdminUser.count({})
        });
    },

    getPageInfo: function ( req, res, module, currentLink ) {
        var searchKey = '';

        if ( req.url ) {
            var params = url.parse(req.url, true);
            searchKey = params.query.searchKey;
        }

        return {
            siteInfo: AdminUtils.getSiteInfo( module[1] ),
            bigCategory: module[0],
            searchKey: searchKey,
            currentLink: currentLink,
            layout: 'manage/public/adminTpl'
        };
    },

    saveSystemLog: function ( type, logs ) {
        var log = new SystemLog();
        log.type = type;
        log.log = logs;
        log.save(function ( err ) {
            if ( err ) {
                console.error(err);
                if ( settings.debug ) {
                    res.end(err);
                }
            }
        });
    },

    saveDataLog: function ( filename, path, logs ) {
        var log = new DataLog();
        log.filename = filename;
        log.log = logs;
        log.path = path;
        log.save(function ( err ) {
            if ( err ) {
                console.error(err);
                if ( settings.debug ) {
                    res.end(err);
                }
            }
        });
    },

    getTarget: function ( type, keywords ) {
        var ret = {
            obj: null,
            key: [],
            group: ''
        };
        var re = keywords && new RegExp( keywords, 'i' );

        switch ( type ) {
            case 'admin_user':
                ret.obj = AdminUser;
                break;
            case 'customer':
                ret.obj = User;
                ret.group = type;
                ret.key.push({ 'group': type });
                break;
            case 'shop_owner':
                ret.obj = User;
                ret.group = type;
                ret.key.push({ 'group': type });
                break;
            case 'blacklist':
                ret.obj = User;
                ret.group = type;
                ret.key.push({ 'group': type });
                break;
            case 'ad':
                ret.obj = Ad;
                break;
            case 'category':
                ret.obj = Category;
                break;
            case 'shop':
                ret.obj = Shop;
                break;
            case 'product':
                ret.obj = Product;
                break;
            case 'order':
                ret.obj = Order;
                break;
            case 'commission':
                ret.obj = Commission;
                ret.key.push({ endDate: { '$ne': null } });
                break;
            case 'system_log':
                ret.obj = SystemLog;
                break;
            case 'data_log':
                ret.obj = DataLog;
                break;
            default:
                return null;
        }

        return ret;
    }

};

module.exports = AdminUtils;
