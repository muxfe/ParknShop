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
     Commission = require('../models/Commission'),
     Message = require('../models/Message');


var _CustomerCategory = [
    { name: 'Home', url: '/user/manage', childs: [] },
    { name: 'Account', url: '#', childs: [
        { name: 'Change Password', url: '/user/manage/config#password', childs: [] },
        { name: 'Change Profile', url: '/user/manage/config#profile', childs: [] },
        { name: 'Message Config', url: '/user/manage/config#message', childs: [] }
    ]},
    { name: 'Message', url: '/user/manage/message', childs: [] },
];

var _IndexCategory = [
    { name: 'Home', url: '/', childs: [] },
    { name: 'Commodity', url: '/category', childs: [] },
    { name: 'Shop', url: '/shop', childs: [] },
];

var SiteUtils = {

    // 设置cookie
    gen_session: function ( user, res ) {
        var auth_token = user._id + '$$$$';
        res.cookie(settings.auth_cookie_name, auth_token,
            { path: '/', maxAge: 1000 * 60 * 60 * 24, signed: true, httpOnly: true }); // cookie有效期 1 天
    },

    saveMessage: function ( receiver, sender, title, content ) {
        var message = new Message({
            receiver_id: receiver,
            sender: sender,
            title: title,
            content: content
        });
        message.save(function (err) {
            if (err) {
                console.log(err);
            }
        });
    },

    getCategory: function ( ) {
        return Category.find({ type: 'system', parentId: 'top' }, 'name url').sort({ sortId: 1 }).find();
    },

    getSiteInfo: function ( ) {
        return {
            title: settings.SITE_TITLE,
            description: settings.SITE_DESCRIPTION,
            keywords: settings.SITE_KEYWORDS
        };
    },

    getData4Index: function ( req, res, title ) {
        return {
            siteConfig: SiteUtils.getSiteInfo( ),
            classify: SiteUtils.getCategory(),
            category: _IndexCategory,
            userInfo: req.session.user,
            logined: req.session.logined,
            layout: 'front/public/defaultTpl'
        };
    },

    getData4Customer: function ( req, res, title ) {
        return {
            siteConfig: SiteUtils.getSiteInfo( ),
            title: title,
            category: _CustomerCategory,
            userInfo: req.session.user,
            logined: req.session.logined,
            layout: 'front/public/defaultTpl'
        };
    }

}

module.exports = SiteUtils;
