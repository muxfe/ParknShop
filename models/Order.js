/*
 * 订单对象
 * Author: x-web
 * Date: 8/10/2015
 */

 var mongoose = require('mongoose'),
     shortid = require('shortid'),
     url = require('url'),
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
    // 用户留言
    message: String,
    // 详细地址
    address: {
        _id: String,
        name: String,
        address: String,
        postcode: String,
        phoneNum: String
    },
    // 产品列表
    products: [
        new Schema({
            _id: String,
            quantity: Number,
            price: Number
        })
    ],
    // 运费信息
    shipping: {
        description: String,
        manner: String, // 运送方式
        deliveryNum: String, // 快递单号
        fare: {
            type: Number,
            default: 0
        }
    },
    // 折扣
    discount: {
        type: Number,
        default: 0
    },
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
    // 订单状态：购物车(cart) -> 提交（submit） -> 支付（pay） -> 发货（delivery） -> 确认（confirm） -> 完成（done）
    state: {
        type: String,
        default: 'submit'
    }
});

var Order = mongoose.model('Order', order);

Order.business = {

    find: function (req, res) {
        var query = url.parse(req.url, true).query,
            keywords = query.keywords,
            state = query.state,
            startDate = new Date(query.startDate),
            endDate = new Date(query.endDate),
            sortByDate = Number(query.sortByDate),
            sortByTotal = Number(query.sortByTotal),
            sortByShop = Number(query.sortByShop),
            conditions = {},
            sort = {};
    },

    findOne: function (id, req, res) {
        var part = url.parse(req.url, true).query.part,
            filter = '',
            condition = {};

        if (part) {
            filter = 'date user total';
        }
        if (id === 'cart') {
            condition = {
                'user._id': req.session.user._id,
                'state': 'cart'
            };
        } else {
            condition = {
                _id: id
            };
        }
        Order.findOne(condition, filter, function (err, order) {
            if (err) {
                console.log(err);
                res.end('error');
            } else {
                res.json(order);
            }
        });
    },

    insert: function (req, res) {
        var Db = require('./db/Db');
        Order.findOne({ 'user._id': req.session.user._id, state: 'cart' }, function (err, order) {
            if (err) {
                console.log(err);
                res.end('error');
            } else {
                req.body.user = {
                    _id: req.session.user._id,
                    username: req.session.user.username
                };
                req.body.state = 'cart';
                if (order) {
                    Order.update({ _id: order._id }, { $set: req.body }, function (err) {
                        if (err) {
                            console.log(err);
                            res.end('error');
                        } else {
                            res.end('success');
                        }
                    });
                } else {
                    Db.addOne(Order, req, res);
                }
            }
        });
    },

    update: function (id, req, res) {
        var Db = require('./db/Db');
        Db.updateOneById(id, Order, req, res);
    },

    delete: function (id, req, res) {
        var Db = require('./db/Db');
        Db.delete(id, Order, req, res);
    }

};

module.exports = Order;
