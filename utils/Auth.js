/*
 * 身份验证对象
 * Author: x-web
 * Date: 23/10/2015
 */

 var User = require('../models/User'),
     Shop = require('../models/Shop');

var Auth = {

    isLogin: function ( req ) {
        return req.session.logined;
    },

    isCustomer: function ( req ) {
        return isLogin( req ) && req.session.user.group === 'customer';
    },

    isShopOwner: function ( req ) {
        return isLogin( req ) && req.session.user.group === 'shop_owner';
    },

    isAdminLogin: function ( req ) {
        return req.session.adminlogined;
    }

};

module.exports = Auth;
