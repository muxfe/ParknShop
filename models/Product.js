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
    details: {
        color: String,
        manufacturer: String,
        brand: String
    },
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
            saledNum: Number,
            price: Number,
            startDate: Date,
            endDate: Date
        })
    ],
    // 库存
    storage: Number,
    // 销量
    saledNum: Number,
    // 商品图片
    images: [ String ],
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
            startPrice = Number(query.startPrice),
            endPrice = Number(query.endPrice),
            startDate = new Date(query.startDate),
            endDate = new Date(query.endDate),
            sortByPrice = Number(query.sortByPrice),
            sortByDate = Number(query.sortByDate),
            sortBySaled = Number(query.sortBySaled),
            conditions = [],
            sort = {};

        if (keywords) {
            var re = new RegExp(keywords, 'i');
            conditions.push({ name: { $regex: re } });
            conditions.push({ description: { $regex: re } });
            conditions.push({ content: { $regex: re } });
            conditions.push({ tags: { $in: [ re ] } });
        }
        if (!isNaN(startPrice) || !isNaN(endPrice)) {
            var condPrice = {};
            if (!isNaN(startPrice)) {
                condPrice.$gte = startPrice;
            }
            if (!isNaN(endPrice)) {
                condPrice.$lte = endPrice;
            }
            conditions.push({ price: condPrice });
        }
        if (!isNaN(startDate.valueOf()) || !isNaN(endDate.valueOf())) {
            var condDate = {};
            if (!isNaN(startDate.valueOf())) {
                condDate.$gte = startDate;
            }
            if (!isNaN(endDate.valueOf())) {
                condDate.$lte = endDate;
            }
            conditions.push({ date: condDate });
        }

        if (!isNaN(sortByPrice)) {
            sort.price = sortByPrice;
        } else if (!isNaN(sortBySaled)) {
            sort.saledNum = sortBySaled;
        } else if (!isNaN(sortByDate)) {
            sort.date = sortByDate;
        }
        Db.pagination(Product, req, res, conditions, sort);
    },

    findOne: function (id, req, res) {
        var Db = require('./db/Db');
        Db.findOne(id, Product, req, res);
    },

    insert: function (req, res) {
        var Shop = require('./Shop'),
            Db = require('./db/Db');
        Shop.findOne({ 'shop_owner._id': req.session.user._id }, function (err, shop) {
            if (shop) {
                req.body.shop = {
                    _id: shop._id,
                    shop_owner_id: shop.shop_owner._id,
                    username: shop.shop_owner.username
                };
                Db.addOne(Product, req, res);
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
                    Db.updateById(id, Product, req, res);
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
        var Db = require('./db/Db');
        Product.findOne({ _id: id }, function (err, product) {
            if (product) {
                if (product.shop.shop_owner_id === req.session.user._id) {
                    Db.delete(id, Product, req, res);
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

module.exports = Product;
