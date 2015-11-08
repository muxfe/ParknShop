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
    // 店铺信息
    shop: {
        _id: String,
        shop_owner_id: String,
        shop_owner_username: String
    },
    // 用户留言
    message: {
        type: String,
        default: ''
    },
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
    // 提交时间
    submitDate: Date,
    // 支付时间
    payDate: Date,
    // 发货时间
    deliveryDate: Date,
    // 确认时间
    confirmDate: Date,
    // 完成时间
    doneDate: Date,
    // 订单状态：购物车(cart) -> 提交（submit） -> 支付（pay） -> 发货（shipping） -> 确认（confirm） -> 完成（done）
    state: {
        type: String,
        default: 'cart'
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
            filter = '';

        if (part) {
            filter = 'date user total shop';
        }

        Order.findOne({ _id: id }, filter, function (err, order) {
            if (err) {
                console.log(err);
                res.end('error');
            } else {
                res.json(order);
            }
        });
    },

    findCart: function (req, res) {
        Order.find({ 'user._id': req.session.user._id, state: 'cart' }, function (err, orders) {
            if (err) {
                console.log(err);
                res.end('error');
            }
            res.json(orders);
        });
    },

    insert: function (req, res) {
        Order.remove({ 'user._id': req.session.user._id, state: 'cart' }, function (err) {
            if (err) {
                console.log(err);
                res.end('error');
            } else {
                var user = {
                    _id: req.session.user._id,
                    username: req.session.user.username
                };
                var shops = req.body.shops, index = 0;
                (function createOrder(index) {
                    if (index === shops.length) {
                        res.end('success');
                        return;
                    }
                    var order = new Order();
                    order.user = user;
                    order.products = shops[index].products;
                    order.shop = shops[index].shop;
                    order.total = shops[index].total;
                    order.save(function (err) {
                        if (err) {
                            console.log(err);
                            res.end('error');
                        } else {
                            createOrder(index + 1);
                        }
                    });
                })(index);
            }
        });
    },

    update: function (id, req, res) {
        var Db = require('./db/Db');
        Order.findOne({ _id: id }, function (err, order) {
            if (err) {
                console.log(err);
                res.end('error');
            } else {
                if (order) {

                    function updateOrder(update, callback) {
                        Order.update({ _id: id }, { $set: update }, function (err) {
                            if (err) {
                                res.end('error');
                            } else {
                                if (callback) {
                                    callback();
                                } else {
                                    res.end('success');
                                }
                            }
                        });
                    }

                    if (order.state === 'cart') {
                        if (order.user._id !== req.session.user._id) {
                            res.end('Permission Denied.');
                            return;
                        }
                        updateOrder(req.body, function () {
                            var User = require('./User');
                            var Product = require('./Product');
                            (function rmCart(i) {
                                if (i === order.products.length) {
                                    return;
                                }
                                User.update({ _id: req.session.user._id }, { $pull: { cart: { _id: order.products[i]._id } } },function (err) {
                                    if (err) {
                                        console.log(err);
                                        res.end('error');
                                    } else {
                                        rmCart(i + 1);
                                    }
                                })
                            })(0);
                            (function reduceStorage(i) {
                                if (i === order.products.length) {
                                    res.end('success');
                                    return;
                                }
                                Product.update({ _id: order.products[i]._id }, { $inc: { storage: -order.products[i].quantity } },function (err) {
                                    if (err) {
                                        console.log(err);
                                        res.end('error');
                                    } else {
                                        reduceStorage(i + 1);
                                    }
                                })
                            })(0);
                        }); // updateOrder
                    } else {
                        updateOrder(req.body);
                    }
                } else {
                    res.end('Order Not Found!');
                }
            }
        });
    },

    delete: function (id, req, res) {
        var Db = require('./db/Db');
        Db.delete(id, Order, req, res);
    }

};

module.exports = Order;
