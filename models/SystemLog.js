/*
 * 系统日志对象
 * Author: x-web
 * Date: 8/10/2015
 */

 var mongoose = require('mongoose'),
     shortid = require('shortid'),
     Schema = mongoose.Schema;

var systemLog = new Schema({
    _id: {
        type: String,
        unique: true,
        'default': shortid.generate
    },
    type:{
        type: String
    },
    date: {
        type: Date,
        default: Date.now
    },
    log: String
});

var SystemLog = mongoose.model('SystemLog', systemLog);

SystemLog.business = {

    delete: function ( id, req, res ) {
        res.end('error');
    }

};

module.exports = SystemLog;
