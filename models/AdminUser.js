/*
 * 管理员对象
 * Author: x-web
 * Date: 6/10/2015
 */
var mongoose = require('mongoose');
var shortid = require('shortid');
var Schema = mongoose.Schema;

var adminUser = new Schema({
  _id: {
    type: String,
    unique: true,
    'default': shortid.generate
  },
  name: String,
  username: String,
  password: String,
  email: String,
  phoneNum: Number,
  comments: String,
  date: {
    type: Date,
    default: Date.now
  },
  logo: {
    type: String,
    default: "upload/images/defaultlogo.png"
  },
  group: String
});

var AdminUser = mongoose.model("AdminUser", adminUser);

module.exports = AdminUser;
