/*
 * 订单对象
 * Author: x-web
 * Date: 8/10/2015
 */

 var mongoose = require('mongoose'),
     shortid = require('shortid'),
     Schema = mongoose.Schema;

var order = new Schema({
    _id: {
        type: String,
        unique: true,
        'default': shortid.generate
    },
    // 购买用户
    user: {
        _id: String,
        username: String
    },
    // 详细地址
    address: {
        province: String,
        city: String,
        street: String,
        postcode: String,
        phoneNum: String,
        name: String // 收件人名称
    },
    // 产品列表
    products: [
        new Schema({
            _id: String,
            name: String,
            quantity: Number,
            price: Number,
            description: String,
            url: String
        })
    ],
    // 价格合计
    total: {
        type: Number,
        default: 0
    },
    // 创建日期
    date: {
        type: Date,
        default: Date.now
    },
    // 支付时间
    payDate: Date,
    // 发货时间
    deliveryDate: Date,
    // 确认时间
    confirmDate: Date,
    // 完成时间
    doneDate: Date,
    // 订单状态：提交（submitted） -> 支付（pay） -> 发货（delivery） -> 确认（confirm） -> 完成（done）
    state: {
        type: String,
        default: 'submitted'
    }
});

var Order = mongoose.model('Order', order);

module.exports = Order;
