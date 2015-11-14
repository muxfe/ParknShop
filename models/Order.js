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
            price: Number,
            isComment: {
                type: Boolean,
                default: false
            }
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
    shippingDate: Date,
    // 确认时间
    confirmDate: Date,
    // 完成时间
    doneDate: Date,
    // 订单状态：购物车(cart) -> 提交（submit） -> 支付（pay） -> 发货（shipping） -> 确认（confirm） -> 完成（done | after comment）
    state: {
        type: String,
        default: 'cart'
    },
    // 评分
    score: {
        type: Number,
        default: 0
    }
});

var Order = mongoose.model('Order', order);

Order.business = {

    query: function (req, res) {
        Order.business.find(req, res);
    },

    find: function (req, res) {
        var Db = require('./db/Db'),
            query = url.parse(req.url, true).query,
            keywords = query.keywords,
            state = query.state,
            // shop_id = query.shop_id,
            role = query.role,
            startDate = new Date(query.startDate),
            endDate = new Date(query.endDate),
            sortByDate = Number(query.sortByDate),
            sortByTotal = Number(query.sortByTotal),
            sortByShop = Number(query.sortByShop),
            conditions = {};

            if (role === 'customer') {
                conditions['user._id'] = req.session.user._id;
            } else if (role === 'shop_owner') {
                conditions['shop.shop_owner_id'] = req.session.user._id;
            } else if (req.session.adminlogined) {
                // next
            } else {
                res.end('Permission Denied.');
                return;
            }

            if (keywords) {
                conditions.$or = [];
                var re = new RegExp(keywords, 'i');
                conditions.$or.push({ message: { $regex: re } });
                conditions.$or.push({ _id: { $regex: re } });
            }
            // if (shop_id) {
            //     conditions['shop._id'] = shop_id;
            // }
            conditions.state = { $ne: 'cart' };
            if (state) {
                conditions.$and = [ { state: state } ];
            }
            if (!isNaN(startDate.valueOf()) || !isNaN(endDate.valueOf())) {
                var condDate = {};
                if (!isNaN(startDate.valueOf())) {
                    condDate.$gte = startDate.toISOString();
                }
                if (!isNaN(endDate.valueOf())) {
                    condDate.$lte = endDate.toISOString();
                }
                conditions.date = condDate;
            }

            Db.pagination(Order, req, res, [conditions]);
    },

    findOne: function (id, req, res) {
        var query = url.parse(req.url, true).query,
            part = query.part,
            role = query.role,
            filter = '',
            conditions = {},
            key = '';

        if (part) {
            filter = 'date user total shop';
        }

        conditions._id = id;

        if (role === 'customer') {
            conditions['user._id'] = req.session.user._id;
        } else if (role === 'shop_owner') {
            conditions['shop.shop_owner_id'] = req.session.user._id;
        } else if (req.session.adminglogined) {
            // next;
        } else {
            res.end('Permission Denied.');
        }

        Order.findOne(conditions, filter, function (err, order) {
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

    update: function (id, operate, req, res) {
        var Db = require('./db/Db');
        var User = require('./User');
        var Product = require('./Product');
        var Shop = require('./Shop');
        var SiteUtils = require('../utils/SiteUtils');
        var user_id = req.session.user._id;

        switch (operate) {
            case 'submit':
                var update = {
                    address: req.body.address,
                    submitDate: new Date().toISOString(),
                    state: 'submit'
                };
                Order.update({ _id: id, 'user._id': user_id, state: 'cart' }, { $set: update }, function (err) {
                    if (err) {
                        console.log(err);
                        res.end('error');
                        return;
                    }
                    Order.findOne({ _id: id, 'user._id': user_id, state: 'submit' }, function (err, order) {
                        if (err) {
                            console.log(err);
                            res.end('error');
                        }
                        if (!order) {
                            res.end('No the order here.');
                        }

                        // 从购物车中删除
                        (function rmCart(i) {
                            if (i === order.products.length) {
                                res.end('success');
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
                    });
                });
                break;
            case 'pay':
                updateOrder({ _id: id, 'user._id': user_id, state: 'submit' }, { state: 'pay', payDate: now() });
                break;
            case 'shipping':
                updateOrder({ _id: id, 'shop.shop_owner_id': user_id, state: 'pay' }, { state: 'shipping', shippingDate: now() }, function (err) {
                    if (err) {
                        res.end('error');
                    } else {
                        Order.findOne({ _id: id, 'shop.shop_owner_id': user_id, state: 'shipping' }, function (err, order) {
                            if (err) {
                                console.log(err);
                                res.end('error');
                            }
                            // bug here
                            if (!order) {
                                res.end('No the order here.');
                                return;
                            }

                            // 从产品库存中删除
                            (function reduceStorage(i) {
                                if (i === order.products.length) {
                                    return;
                                }
                                SiteUtils.incStorage(order.products[i]._id, -order.products[i].quantity, function (err) {
                                    if (err) {
                                        console.log(err);
                                        res.end('error');
                                    } else {
                                        reduceStorage(i + 1);
                                    }
                                })
                            })(0);

                            // 更新shop nSaled
                            SiteUtils.incSaled(order.shop._id, order.products.length);
                            res.end('success');
                        });
                    }
                });
                break;
            case 'confirm':
                updateOrder({ _id: id, 'user._id': user_id, state: 'shipping' }, { state: 'confirm', confirmDate: now() }, function (err) {
                    if (err) {
                        res.end('error');
                    } else {
                        res.end('success');
                    }
                });
                break;
            case 'done':
                updateOrder({ _id: id, 'user._id': user_id, state: 'confirm' }, { state: 'done', score: req.body.score, doneDate: now() });
                break;
            default:
                res.end('Error Operation.');
                break;
        }

        function updateOrder(selector, update, callback) {
            Order.update(selector, { $set: update }, function (err) {
                if (err) {
                    console.log(err);
                    callback ? callback(err) : res.end('error');
                } else {
                    callback ? callback() : res.end('success');
                }
            });
        }

        function now() {
            return new Date().toISOString();
        }
    },

    delete: function (id, req, res) {
        Order.remove({ _id: id, 'user._id': req.session.user._id, state: 'submit' }, function (err) {
            if (err) {
                console.log(err);
                res.end('error');
            } else {
                res.end('success');
            }
        });
    }

};

module.exports = Order;
