/*
 * 站点工具对象
 * Author: x-web
 * Date: 8/10/2015
 */

 var settings = require('../models/db/settings'),
     User = require('../models/User'),
     Shop = require('../models/Shop'),
     Order = require('../models/Order'),
     Product = require('../models/Product'),
     Category = require('../models/Category'),
     Ad = require('../models/Ad'),
     Commission = require('../models/Commission');


var SiteUtils = {

    // 设置cookie
    gen_session: function ( user, res ) {
        var auth_token = user._id + '$$$$';
        res.cookie(settings.auth_cookie_name, auth_token,
            { path: '/', maxAge: 1000 * 60 * 60 * 24, signed: true, httpOnly: true }); // cookie有效期 1 天
    },

    getSiteInfo: function ( description ) {
        return {
            title: settings.SITE_TITLE,
            description: description,
            keywords: settings.SITE_KEYWORDS
        };
    },

    getData4User: function ( req, res, title, token ) {
        return {
            siteConfig: SiteUtils.getSiteInfo( title ),
            userInfo: req.session.user,
            token: token,
            layout: 'front/public/defaultTpl'
        };
    }

}

module.exports = SiteUtils;
