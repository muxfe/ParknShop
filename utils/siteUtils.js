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
        { name: 'Change Password', url: '/user/manage/profile#password', childs: [] },
        { name: 'Change Profile', url: '/user/manage/profile#profile', childs: [] },
        { name: 'Message Config', url: '/user/manage/profile#message', childs: [] }
    ]},
    { name: 'Message', url: '/user/manage/message', childs: [] },
];

var _ShopOwnerCategory = [
    { name: 'Home', url: '/shop/manage', childs: [] }
];

var _IndexCategory = [
    { name: 'Home', url: '/', childs: [] },
    { name: 'Commodity', url: '/search', childs: [] },
    { name: 'Shop', url: '/search?stype=shop', childs: [] },
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

    getCommission: function ( ) {
        return Commission.find({ endDate: null }, 'rate').find();
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

    getData4Product: function ( req, res, id, title ) {
        return {
            siteConfig: SiteUtils.getSiteInfo(),
            productId: id,
            category: _IndexCategory,
            userInfo: req.session.user,
            logined: req.session.logined,
            title: title,
            layout: 'front/public/defaultTpl'
        };
    },

    getData4Shop: function ( req, res, id, title ) {
        return {
            siteConfig: SiteUtils.getSiteInfo(),
            shopId: id,
            category: _IndexCategory,
            userInfo: req.session.user,
            logined: req.session.logined,
            title: title,
            layout: 'front/public/defaultTpl'
        };
    },

    getData4Search: function ( req, res, stype, keyword, title ) {
        return {
            siteConfig: SiteUtils.getSiteInfo(),
            stype: stype,
            keyword: keyword,
            category: _IndexCategory,
            userInfo: req.session.user,
            logined: req.session.logined,
            title: title,
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
    },

    getData4ShopOwner: function ( req, res, title ) {
        return {
            siteConfig: SiteUtils.getSiteInfo( ),
            title: title,
            category: _ShopOwnerCategory,
            userInfo: req.session.user,
            logined: req.session.logined,
            home: '/shop/manage/',
            layout: 'front/public/defaultTpl'
        };
    },

    data2tree: function ( data ) {
        var d = { }, // 生成树的中间结果，利用了对象属性的哈希特性
            da = [ ], // 返回的结果数组，内容为Category对象
            keys = [ ]; // 为了保证SortId的有序，先保存所有已排序Top目录的_id，后面用此_id遍历对象属性
        for ( var i = 0; i < data.length; i++ ) {
            if ( data[i].parentId === 'top' ) {
                if ( typeof d[data[i]._id] === 'undefined' ) {
                    d[data[i]._id] = { };
                    if ( keys.join(',').indexOf( data[i]._id ) < 0 ) {
                        keys.push( data[i]._id );
                    }
                }
                d[data[i]._id].me = data[i];
            } else {
                if ( typeof d[data[i].parentId] === 'undefined' ) {
                    d[data[i].parentId] = { };
                    if ( keys.join(',').indexOf( data[i].parentId ) < 0 ) {
                        keys.push( data[i].parentId );
                    }
                }
                if ( typeof d[data[i].parentId].children === 'undefined' ) {
                    d[data[i].parentId].children = [];
                }
                d[data[i].parentId].children.push(data[i]);
            }
        }
        // console.log(d);
        for ( var j = 0; j < keys.length; j++ ) {
            var top = {
                me: d[keys[j]].me,
                children: []
            };
            if ( typeof d[keys[j]].children !== 'undefined' ) {
                for ( var i = 0; i < d[keys[j]].children.length; i++ ) {
                    top.children.push(d[keys[j]].children[i]); // 依次将子目录加在父目录后面
                }
            }
            da.push(top);
        }
        // console.log(da);
        return da;
    },

    incVisits: function (obj, id) {
        obj.update({ _id: id }, { $inc: { visits: 1 } }, function (err) {
            if (err) {
                console.log(err);
            }
        });
    },

    incProducts: function (id, value) {
        var val = value || 1;
        Shop.update({ _id: id }, { $inc: { nProducts: val } }, function (err) {
            if (err) {
                console.log(err);
            }
        });
    },

    incSales: function (id, value) {
        var val = value || 1;
        Shop.update({ _id: id }, { $inc: { nSales: val } }, function (err) {
            if (err) {
                console.log(err);
            }
        });
    }

}

module.exports = SiteUtils;
