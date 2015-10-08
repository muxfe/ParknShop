/*
 * 用户对象
 * Author: x-web
 * Date: 8/10/2015
 */

var mongoose = require('mongoose'),
    shortid = require('shortid');

var User = mongoose.model('User', {
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
    // 用户组，默认为消费者
    group: {
        type: String,
        default: 'customer'
    },
    // 收货地址
    address: [
        {
            name: String,
            postcode: Number,
            address: String,
            phoneNum: String,
            isDefault: Boolean
        }
    ],
    // 购物车
    cart: [
        {
            product_name: String,
            product_link: String,
            product_id: String,
            product_num: Number
        }
    ]
});

module.exports = User;
