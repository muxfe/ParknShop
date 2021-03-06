/*
 * 评论对象
 * Author: x-web
 * Date: 13/11/2015
 */

var mongoose = require('mongoose'),
    shortid = require('shortid'),
    url = require('url'),
    Schema = mongoose.Schema;

var comment = new Schema({
    _id: {
        type: String,
        unique: true,
        'default': shortid.generate
    },
    date: {
        type: Date,
        default: Date.now
    },
    content: String,
    title: String,
    score: {
        type: Number,
        default: 0
    },
    helpful: {
        type: Number,
        default: 0
    },
    helpful_user: [ String ],
    unhelpful: {
        type: Number,
        default: 0
    },
    unhelpful_user: [ String ],
    user: {
        _id: String,
        username: String
    },
    product_id: String,
    order_id: String
});

var Comment = mongoose.model("Comment", comment);

Comment.business = {

    find: function (req, res) {
        var Db = require('./db/Db'),
            query = url.parse(req.url, true).query,
            product_id = query.product_id || '',
            user_id = query.user_id || '',
            conditions = {};

        if (product_id) {
            conditions.product_id = product_id;
        } else if (user_id) {
            conditions['user._id'] = user_id;
        } else {
            res.end('error');
            return;
        }

        Db.pagination(Comment, req, res, [conditions]);
    },

    findOne: function (id, req, res) {
        Comment.findOne({ _id: id }, function (err, comment) {
            if (err) {
                console.log(err);
                res.end('error');
            } else {
                res.json(comment);
            }
        });
    },

    update: function (id, req, res) {
        var update = {};
        if (req.body.helpful) {
            update.$inc = {
                helpful: 1
            };
            update.helpful_user = {
                $addToSet: req.session.user._id
            };
        } else if (req.body.unhelpful) {
            update.$inc = {
                unhelpful: 1
            };
            update.unhelpful_user = {
                $addToSet: req.session.user._id
            };
        } else {
            res.end('error');
        }
        Comment.update({ _id: id }, { $set: update }, function (err) {
            if (err) {
                console.log(err);
                res.end('error');
            } else {
                res.end('success');
            }
        });
    },

    insert: function (req, res) {
        var Order = require('./Order');
        req.body.user = {
            _id: req.session.user._id,
            username: req.session.user.username
        }
        var comment = new Comment(req.body);
        comment.save(function (err) {
            if (err) {
                console.log(err);
                res.end('error');
            } else {
                var query = {
                        _id: req.body.order_id,
                        'user._id': req.session.user._id,
                        'products._id': req.body.product_id
                    },
                    update = {
                        'products.$.isComment': true
                    };
                Order.update(query, { $set: update }, function (err) {
                    if (err) {
                        res.end('error');
                    } else {
                        res.end('success');
                    }
                })
            }
        });
    },

    delete: function (id, req, res) {
        Comment.remove({ _id: id, 'user._id': req.session.user._id }, function (err) {
            if (err) {
                console.log(err);
                res.end('error');
            } else {
                res.end('success');
            }
        });
    },

    countProductStar: function (id, req, res) {
        Comment.aggregate([
            {
                $match: {
                    product_id: id
                }
            },
            {
                $group: {
                    _id: null,
                    avgScore: { $avg: "$score" },
                    count: { $sum: 1 }
                }
            }
        ], function (err, result) {
            if (err) {
                res.end('error');
            } else {
                res.json(result);
            }
        });
    }
};

module.exports = Comment;
