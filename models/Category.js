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
    shop: {
        _id: String,
        shop_owner_id: String,
        shop_owner_username: String
    }
});

var Category = mongoose.model('Category', category);

Category.business = {

    query: function ( req, res, shop ) {
        var query = url.parse( req.url, true ).query,
            keyword = query.searchKey,
            re = new RegExp( keyword, 'i' ),
            key = [ ],
            type = 'system';
        if (shop) {
            type = "shop";
        }
        Category.find( {
                type: type,
                'shop.shop_owner_id': shop ? req.session.user._id : null,
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
        Category.find( { parentId: id }, function ( err, result ) {
            if ( err ) {
                console.log( err );
                res.end( 'error' );
                return;
            }
            if ( result && result.length > 0 ) {
                res.end('Cannot delete this category that has childs.Please delete these first.');
            } else {
                if (Auth.isAdminLogin(req)) {
                    Db.delete( id, Category, req, res, req.session.adminUserInfo.username + ' delete the category(' + id + ')');
                } else if (Auth.isShopOwner(req)) {
                    Category.remove({ _id: id, 'shop.shop_owner_id': req.session.user._id }, function (err) {
                        if (err) {
                            console.log(err);
                            res.end('error');
                        } else {
                            res.end('success');
                        }
                    });
                }
            }
        });
    },

    insert: function ( req, res ) {
        var Db = require('./db/Db');
        var username = req.session.adminUserInfo.username;
        req.body.keywords = req.body.keywords.split(';');
        req.body.type = 'system';
        Db.addOne( Category, req, res, username + ' insert a category.' );
    },

    insertByUser: function (req, res) {
        var Db = require('./db/Db');
        Shop.findOne({ 'shop_owner._id': req.session.user._id }, function (err, shop) { // 验证店主
			if (err) {
				console.log(err);
				res.end('error');
				return;
			}
			if (shop) {
				req.body.shop = {
                    _id: shop._id,
                    shop_owner_id: shop.shop_owner._id,
                    shop_owner_username: shop.shop_owner._username
                }
                req.body.type = 'shop';
                req.body.keywords = req.body.keywords.split(';');
                Db.addOne(Category, req, res);
			} else {
				res.end('You dont have a shop.');
			}
		});
    },

    update: function ( id, req, res ) {
        var Db = require('./db/Db');
        var username = req.session.adminUserInfo.username;
        Db.updateOneById( id, Category, req, res, username + ' update the category(' + id + ')' );
    },

    updateByUser: function (id, req, res) {
        Category.update({ _id: id, 'shop.shop_owner_id': req.session.user._id }, { $set: req.body }, function (err) {
            if (err) {
                console.log(err);
                res.end('error');
            } else {
                res.end('success');
            }
        })
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
    },

    findOne: function ( id, req, res ) {
        Category.findOne({ _id: id }, function (err, result) {
            if (err) {
                console.log(err);
                res.end('error');
            } else {
                res.json(result);
            }
        });
    }

};

module.exports = Category;
