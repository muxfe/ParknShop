/*
 * 管理员对象
 * Author: x-web
 * Date: 6/10/2015
 */
var mongoose = require('mongoose'),
    shortid = require('shortid'),
    url = require('url'),
    Db = require('./db/Db'),
    settings = require('./db/settings'),
    Schema = mongoose.Schema;

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
  updateDate: {
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

//
AdminUser.business = {

    insert: function ( req, res ) {
        AdminUser.findOne( { username: req.body.username }, function ( err, user ) {
            if ( user ) {
                res.end('This user is existed.');
            } else {
                req.body.password = Db.encrypt( req.body.password, settings.encrypt_key );
                Db.addOne( AdminUser, req, res, req.session.adminUserInfo.username + ' add new admin user.' );
            }
        })
    },

    update: function ( _id, req, res ) {
        req.body.password = Db.encrypt( req.body.password, settings.encrypt_key );
        Db.updateOneById( _id, AdminUser, req, res, req.session.adminUserInfo.username + ' update the ' + req.body.username + '\' info.' );
    },

    delete: function ( id, req, res ) {
        if ( req.session.adminUserInfo._id === id ) {
            res.end('Cannot delete current logined administrator.');
        } else {
            Db.delete( id, AdminUser, req, res, req.session.adminUserInfo.username + ' delete a adminuser( ' + id + ')' );
        }
    }

}

module.exports = AdminUser;
