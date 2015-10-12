/*
 * 用户对象
 * Author: x-web
 * Date: 8/10/2015
 */

var mongoose = require('mongoose'),
    shortid = require('shortid'),
    Schema = mongoose.Schema;

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
            name: String,
            postcode: Number,
            address: String,
            phoneNum: String,
            isDefault: Boolean
        })
    ],
    // 购物车
    cart: [
        new Schema({
            product_name: String,
            product_link: String,
            product_id: String,
            product_num: Number
        })
    ]
});

var User = mongoose.model( 'User', user );

User.business = {

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
    }

};

module.exports = User;
