/*
 * 商铺对象
 * Author: x-web
 * Date: 8/10/2015
 */

 var mongoose = require('mongoose'),
     shortid = require('shortid'),
     Schema = mongoose.Schema;

var shop = new Schema({
    _id: {
        type: String,
        unique: true,
        'default': shortid.generate
    },
    name: String,
    user: {
        _id: String,
        name: String
    },
    phoneNum: String,
    address: String,
    email: String,
    description: String,
    ads: [
        new Schema({
            title: String,
            url: String,
            image: {
                type: String,
                default: 'upload/images/default_shop_ad.jpg'
            }
        })
    ]
});

var Shop = mongoose.model('Shop', shop);

module.exports = Shop;
