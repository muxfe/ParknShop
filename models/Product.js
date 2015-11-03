/*
 * 商品对象
 * Author: x-web
 * Date: 8/10/2015
 */

 var mongoose = require('mongoose'),
     shortid = require('shortid'),
     url = require('url'),
     Schema = mongoose.Schema;

var product = new Schema({
    _id: {
        type: String,
        unique: true,
        'default': shortid.generate
    },
    // 商品名称
    name: String,
    // 分类目录ID
    category_id: String,
    // 店铺分类目录
    shop_category_id: String,
    // 属于的店家
    shop: {
        _id: String,
        shop_owner_id: String,
        username: String
    },
    // 描述
    description: String,
    // 内容
    content: String,
    // 细节
    details: {},
    // 状态： on_sale | off_sale
    state: {
        type: String,
        default: 'on_sale'
    },
    // 售价
    price: Number,
    // 价格历史
    price_history: [
        new Schema({
            price: Number,
            startDate: Date,
            endDate: Date
        })
    ],
    // 库存
    storage: Number,
    // 销量
    nSaled: {
        type: Number,
        default: 0
    },
    // 商品图片
    logo: String,
    // 运费说明
    transport: String,
    // 标签
    tags: [ String ],
    // 访问量
    visits: {
        type: Number,
        default: 0
    },
    // 日期
    date: {
        type: Date,
        default: Date.now
    },
    // 最近修改日期
    lastDate: {
        type: Date,
        default: Date.now
    }
});

var Product = mongoose.model('Product', product);

Product.business = {

    find: function (req, res) {
        var Db = require('./db/Db'),
            query = url.parse(req.url, true).query,
            keywords = query.keywords,
            state = query.state,
            shop_id = query.shop_id,
            startPrice = Number(query.startPrice),
            endPrice = Number(query.endPrice),
            startDate = new Date(query.startDate),
            endDate = new Date(query.endDate),
            sortByPrice = Number(query.sortByPrice),
            sortByDate = Number(query.sortByDate),
            sortBySaled = Number(query.sortBySaled),
            sortByVisits = Number(query.sortByVisits),
            sortByStorage = Number(query.sortByStorage),
            conditions = {},
            sort = {};

        if (keywords) {
            conditions.$or = [];
            var re = new RegExp(keywords, 'i');
            conditions.$or.push({ name: { $regex: re } });
            conditions.$or.push({ description: { $regex: re } });
            conditions.$or.push({ content: { $regex: re } });
            conditions.$or.push({ tags: { $in: [ re ] } });
        }
        if (shop_id) {
            conditions['shop._id'] = shop_id;
        }
        if (state) {
            conditions.state = state;
        }
        if (!isNaN(startPrice) || !isNaN(endPrice)) {
            var condPrice = {};
            if (!isNaN(startPrice)) {
                condPrice.$gte = startPrice;
            }
            if (!isNaN(endPrice)) {
                condPrice.$lte = endPrice;
            }
            conditions.price = condPrice;
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

        if (!isNaN(sortByPrice) && (sortByPrice == 1 || sortByPrice == -1)) {
            sort.price = sortByPrice;
        } else if (!isNaN(sortBySaled) && (sortBySaled == 1 || sortBySaled == -1)) {
            sort.nSaled = sortBySaled;
        } else if (!isNaN(sortByDate) && (sortByDate == 1 || sortByDate == -1)) {
            sort.date = sortByDate;
        } else if (!isNaN(sortByVisits) && (sortByVisits == 1 || sortByVisits == -1)) {
            sort.visits = sortByVisits;
        } else if (!isNaN(sortByStorage) && (sortByStorage == 1 || sortByStorage == -1)) {
            sort.storage = sortByStorage;
        } else {
            sort.date = -1;
        }
        // console.log(conditions);
        // console.log(sort);
        Db.pagination(Product, req, res, [conditions], sort);
    },

    findOne: function (id, req, res) {
        var Db = require('./db/Db');
        Db.findOne(id, Product, req, res);
    },

    insert: function (req, res) {
        var Shop = require('./Shop'),
            Db = require('./db/Db'),
            SiteUtils = require('../utils/SiteUtils');
        Shop.findOne({ 'shop_owner._id': req.session.user._id }, function (err, shop) {
            if (shop) {
                handleData(req);
                req.body.shop = {
                    _id: shop._id,
                    shop_owner_id: shop.shop_owner._id,
                    username: shop.shop_owner.username
                };

                Db.addOne(Product, req, res);
                SiteUtils.incProducts(shop._id);
            } else if (err) {
                console.log(err);
                res.end('error');
            } else {
                res.end('You have no shop.');
            }
        });
    },

    update: function (id, req, res) {
        var Db = require('./db/Db');
        Product.findOne({ _id: id }, function (err, product) {
            if (product) {
                if (product.shop.shop_owner_id === req.session.user._id) {
                    handleData(req);
                    var lastDate = new Date().toISOString();
                    if (product.price !== req.body.price) {
                        req.body.$push = {
                                price_history: {
                                    price: product.price,
                                    startDate: product.lastDate,
                                    endDate: lastDate
                                }
                        };
                    }
                    req.body.lastDate = lastDate;
                    Db.updateOneById(id, Product, req, res);
                } else {
                    res.end('Permission Denied.');
                }
            } else if (err) {
                console.log(err);
                res.end('error');
            } else {
                res.end('This product is not existed.');
            }
        });
    },

    delete: function (id, req, res) {
        var Db = require('./db/Db'),
            SiteUtils = require('../utils/SiteUtils');
        Product.findOne({ _id: id }, function (err, product) {
            if (product) {
                if (product.shop.shop_owner_id === req.session.user._id) {
                    Db.delete(id, Product, req, res);
                    SiteUtils.incProducts(product.shop._id, -1);
                } else {
                    res.end('Permission Denied.');
                }
            } else if (err) {
                console.log(err);
                res.end('error');
            } else {
                res.end('This product is not existed.');
            }
        });
    }

};

function handleData(req) {
    var price = Number(req.body.price),
        storage = Number(req.body.storage),
        category_id = req.body.category_id,
        shop_category_id = req.body.shop_category_id;

    req.body.tags = req.body.tags.split(','); // split with ','
    req.body.category_id = category_id ? category_id : 'none';
    req.body.shop_category_id = shop_category_id ? shop_category_id : 'none';
    req.body.price = isNaN(price) ? 0 : price;
    req.body.storage = isNaN(storage) ? 0 : storage;
    req.body.state = req.body.storage ? 'on_sale' : 'off_sale';
}

module.exports = Product;
