/*
 * 商品对象
 * Author: x-web
 * Date: 8/10/2015
 */

 var mongoose = require('mongoose'),
     shortid = require('shortid'),
     Schema = mongoose.Schema;

var product = new Schema({
    _id: {
        type: String,
        unique: true,
        'default': shortid.generate
    },
    // 商品名称
    name: String,
    // 属于的分类目录
    category: {
        _id: String,
        name: String,
        url: String
    },
    // 属于的店家
    shop: {
        _id: String,
        shop_owner_id: String,
        name: String
    },
    // 描述
    description: String,
    // 内容
    content: String,
    // 售价
    price: Number,
    // 库存
    storage: Number,
    // 销量
    saledNum: Number,
    // 商品图片
    images: [ String ],
    // 评论
    comments: [
        new Schema({
            username: String,
            user_id: String,
            content: String,
            score: Number, // 评分
            date: {
                type: Date,
                default: Date.now
            }
        })
    ],
    // 运费说明
    transport: String
});

var Product = mongoose.model('Product', product);

module.exports = Product;
