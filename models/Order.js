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
    user: {
        _id: String,
        name: String
    },
    address: String,
    products: [
        new Schema({
            _id: String,
            name: String,
            quantity: Number,
            description: String,
            url: String
        })
    ],
    shop: {
        _id: String,
        name: String,
        url: String
    },
    date: {
        type: Date,
        default: Date.now
    },
    // 订单状态：提交 -> 支付 -> 发货 -> 确认 -> 完成
    state: {
        type: String,
        default: 'submitted'
    }
});

var Order = mongoose.model('Order', order);

module.exports = Order;
