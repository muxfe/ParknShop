/*
 * 用户对象
 * Author: x-web
 * Date: 8/10/2015
 */

var mongoose = require('mongoose'),
    shortid = require('shortid'),
    Schema = mongoose.Schema,
    settings = require('./db/settings'),
    url = require('url');

var user = new Schema({
    _id: {
        type: String,
        unique: true,
        'default': shortid.generate
    },
    name: String,
    username: String,
    password: String,
    email: String,
    phoneNum: String,
    description: {
        type: String,
        default: 'This guy is lazy, nothing here...'
    },
    date: {
        type: Date,
        default: Date.now
    },
    logo: {
        type: String,
        default: '/upload/images/defaultlogo.png'
    },
    // 用户组，默认为消费者，customer / shop_owner / blacklist
    group: {
        type: String,
        default: 'customer'
    },
    // 拉黑用户后的原用户组备份
    group_bak: String,
    // 收货地址
    address: [
        new Schema({
            _id: {
                type: String,
                unique: true,
                default: shortid.generate
            },
            name: String,
            postcode: Number,
            address: String,
            phoneNum: String,
            isDefault: {
                type: Boolean,
                default: false
            }
        })
    ],
    // 购物车
    cart: [
        new Schema({
            _id: String,
            quantity: Number
        })
    ]
});

var User = mongoose.model( 'User', user );

User.business = {

    insert: function ( req, res ) {
        var Db = require('./db/Db');
        User.findOne( { username: req.body.username }, function ( err, user ) {
            if ( user ) {
                res.end( user.username + ' was already existed.' );
            } else {
                req.body.password = Db.encrypt( req.body.password, settings.encrypt_key );
                Db.addOne( User, req, res, req.body.username + ' join in us.' );
            }
        });
    },

    delete: function ( id, req, res, target ) {
        var Db = require('./db/Db');
        if ( target.group === 'blacklist' ) {
            // 如果用户已在黑名单中，删除操作将从数据库中删除用户数据
            Db.delete( id, User, req, res, req.session.adminUserInfo.username + ' delete user(' + id + ') from blacklist.' );
        } else {
            // 如果用户不在黑名单中，删除操作将用户加入黑名单
            req.body.group = 'blacklist';
            req.body.group_bak = target.group;
            Db.updateOneById( id, User, req, res, req.session.adminUserInfo.username + ' join user(' + id + ') to blacklist.' );
        }
    },

    update: function ( id, req, res ) {
        // 从黑名单中恢复
        var Db = require('./db/Db');
        User.findOne( { _id: id}, function ( err, user ) {
            if ( err ) {
                console.log(err);
                res.end('error');
            } else {
                req.body.group = user.group_bak;
                Db.updateOneById( id, User, req, res, req.session.adminUserInfo.username + ' recovery a user(' + id + ')' );
            }
        });
    },

    updateByUser: function (req, res) {
        var Db = require('./db/Db'),
            password = url.parse(req.url, true).query.password;

        if (password) {
            User.findOne({ _id: req.session.user._id }, 'password', function (err, user) {
                if (user) {
                    if (user.password === Db.encrypt(req.body.oldPwd, settings.encrypt_key)) {
                        if (req.body.newPwd === req.body.confirmNewPwd) {
                            req.body = { password: Db.encrypt(req.body.newPwd, settings.encrypt_key) };
                            Db.updateOneById(req.session.user._id, User, req, res);
                        } else {
                            res.end("Twice password you entered is not same.");
                        }
                    } else {
                        res.end("Your enter the old password is not correct.");
                    }
                } else {
                    console.log(err || 'error');
                    res.end('error');
                }
            });
        } else {
            Db.updateOneById(req.session.user._id, User, req, res);
        }
    },

    changeCart: function (req, res) {
        var user_id = req.session.user._id,
            product_id = req.body._id || '',
            quantity = req.body.quantity || 1;
        User.findOne({ _id: user_id, 'cart._id': product_id }, function (err, user) {
            if (user) {
                User.update({ _id: user_id, 'cart._id': product_id }, { $inc: { 'cart.$.quantity': quantity } }, function (err) {
                    if (err) {
                        res.end('error');
                        console.log(err);
                    } else {
                        res.end('success');
                    }
                });
            } else {
                User.update({ _id: user_id }, { $push: { cart: req.body } },function (err) {
                    if (err) {
                        console.log(err);
                        res.end('error');
                    } else {
                        res.end('success');
                    }
                });
            }
        });
    },

    deleteCart: function (id, req, res) {
        User.update({ _id: req.session.user._id }, { $pull: { cart: { _id: id } } }, function (err) {
            if (err) {
                res.end('error');
                console.log(err);
            } else {
                res.end('success');
            }
        });
    },

    insertAddr: function (req, res) {
        User.update({ _id: req.session.user._id }, { $push: { address: req.body } }, function (err) {
            if (err) {
                console.log(err);
                res.end('error');
            } else {
                res.end('success');
            }
        });
    },

    updateAddr: function (id, req, res) {
        User.update({ _id: req.session.user._id, 'address._id': id }, { $set: { 'address.$': req.body } }, function (err) {
            if (err) {
                console.log(err);
                res.end('error');
            } else {
                res.end('success');
            }
        });
    },

    deleteAddr: function (id, req, res) {
        User.update({ _id: req.session.user._id }, { $pull: { address: { _id: id } } }, function (err) {
            if (err) {
                res.end('error');
                console.log(err);
            } else {
                res.end('success');
            }
        });
    }

};

module.exports = User;
