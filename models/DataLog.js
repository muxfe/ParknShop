/*
 * 数据备份记录对象
 * Author: x-web
 * Date: 11/10/2015
 */

var mongoose = require('mongoose'),
    shortid = require('shortid'),
    Schema = mongoose.Schema;

var dataLog = new Schema({
    _id: {
        type: String,
        unique: true,
        'default': shortid.generate
    },
    date: {
        type: Date,
        default: Date.now
    },
    filename: String,
    path: String,
    log: String
});

var DataLog = mongoose.model("DataLog", dataLog);

DataLog.business = {

    delete: function ( id, req, res ) {
        var Db = require('./db/Db');
        Db.delete( id, DataLog, req, res, req.session.adminUserInfo.username + ' delete a datalog(' + id  + ')' );
    }

};

module.exports = DataLog;
