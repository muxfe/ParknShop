/*
 * 手续费对象
 * Author: x-web
 * Date: 17/10/2015
 */

 var mongoose = require('mongoose'),
     shortid = require('shortid'),
     Schema = mongoose.Schema;

var commission = new Schema({
    _id: {
        type: String,
        unique: true,
        'default': shortid.generate
    },
    rate: {
        type: Number,
        default: 0.0
    },
    startDate: {
        type: Date,
        default: Date.now
    },
    endDate: {
        type: Date,
        default: null
    }
});

var Commission = mongoose.model('Commission', commission);

Commission.business = {

    query_current: function ( req, res ) {
        Commission.findOne( { endDate: null }, function ( err, result ) {
            if ( err ) {
                res.end(err);
                console.log(err);
                return;
            }
            if ( result ) {
                res.json( result );
            }
        });
    },

    delete: function ( id, req, res ) {
        res.end('error');
    },

    // 不用id，仅为占位符
    update: function ( id, req, res ) {
        var Db = require('./db/Db');
        Commission.count( { }, function ( err, count ) {
            if ( err ) {
                console.log(err);
                res.end('error');
                return;
            }

            var logMsg = req.session.adminUserInfo.username + ' update commission(' + req.body.rate + ')';
            if ( count === 0) {
                Db.addOne( Commission, req, res, logMsg );
            } else {
                Commission.update( { endDate: null }, { $set: { endDate: new Date() } }, function ( err ) {
                    if ( err ) {
                        console.log(err);
                        res.end('error');
                        return;
                    }
                    Db.addOne( Commission, req, res, logMsg );
                });
            }
        });
    }

};

module.exports = Commission;
