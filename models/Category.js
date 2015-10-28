/*
 * 商品目录对象
 * Author: x-web
 * Date: 8/10/2015
 */

var mongoose = require('mongoose'),
    shortid = require('shortid'),
    url = require('url'),
    Schema = mongoose.Schema,
    Auth = require('../utils/Auth');

var category = new Schema({
    _id: {
        type: String,
        unique: true,
        'default': shortid.generate
    },
    // 名称
    name: String,
    url: String,
    keywords: [ String ],
    description: String,
    date: {
        type: Date,
        default: Date.now
    },
    // 是否公开
    state: {
        type: Boolean,
        default: true
    },
    // 排序
    sortId: {
        type: Number,
        default: 1
    },
    // 父目录列表，top | id
    parentId: {
        type: String,
        default: 'top'
    },
    // 类型，system | shop
    type: {
        type: String,
        default: 'shop'
    },
    // if type === 'shop'
    shop_id: String
});

var Category = mongoose.model('Category', category);

Category.business = {

    query: function ( req, res, shop_id ) {
        var query = url.parse( req.url, true ).query,
            keyword = query.searchKey,
            re = new RegExp( keyword, 'i' ),
            key = [ ],
            type = 'system';
        if (shop_id) {
            type = "shop";
        } else {
            shop_id = null;
        }
        Category.find( {
                type: type,
                shop_id: shop_id,
                $or: [
                    { name: { $regex: re } },
                    { description: { $regex: re } },
                    { url: { $regex: re } }
                ]
            })
            .sort( { sortId: 1 } )
            .exec( function ( err, result ) {
                if ( err ) {
                    res.end( 'error' );
                    console.log(err);
                    return;
                }
                res.json( result );
            });
    },

    delete: function ( id, req, res ) {
        var Db = require('./db/Db');
        var cursor = Category.find( { parentId: id }, function ( err, result ) {
            if ( err ) {
                console.log( err );
                res.end( 'error' );
                return;
            }
            if ( result.length > 0 ) {
                res.end('Cannot delete this category that has childs.Please delete these first.');
            } else {
                var username = '';
                if (Auth.isAdminLogin(req)) {
                    username = req.session.adminUserInfo.username;
                } else if (Auth.isShopOwner(req)) {
                    username = req.session.user.username;
                }
                Db.delete( id, Category, req, res, username + ' delete the category(' + id + ')');
            }
        });
    },

    insert: function ( req, res ) {
        var Db = require('./db/Db');
        var username = '';
        req.body.keywords = req.body.keywords.split(';');
        if (req.body.shop_id) {
            username = req.session.user.username;
        } else {
            username = req.session.adminUserInfo.username;
            req.body.type = 'system';
        }
        Db.addOne( Category, req, res, username + ' insert a category.' );
    },

    update: function ( id, req, res ) {
        var Db = require('./db/Db');
        var username = '';
        if (Auth.isAdminLogin(req)) {
            username = req.session.adminUserInfo.username;
        } else if (Auth.isShopOwner(req)) {
            username = req.session.user.username;
        }
        Db.updateOneById( id, Category, req, res, username + ' update the category(' + id + ')' );
    },

    find: function ( req, res, condition ) {
        var SiteUtils = require('../utils/SiteUtils');
        Category.find(condition)
            .sort({ sortId: 1 })
            .exec(function (err, data) {
                if (err) {
                    console.log(err);
                    res.end('error');
                    return;
                }
                res.json(SiteUtils.data2tree(data));
            });
    }

};

module.exports = Category;
