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
    // 分类目录ID
    category_id: String,
    // 店铺分类目录
    shop_category_id: String,
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
    tags: [ String ]
});

var Product = mongoose.model('Product', product);

module.exports = Product;
