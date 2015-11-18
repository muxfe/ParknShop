/*
 * 初始数据生成
 * Author: x-web
 * Date: 18/11/2015
 */

var AdminUser = require('./models/AdminUser'),
    Db = require('./models/db/Db'),
    settings = require('./models/db/settings');

var admin = new AdminUser();
admin.name = 'admin';
admin.username = 'admin';
admin.password = Db.encrypt('admin', settings.encrypt_key);
admin.group = 'admin';
admin.save(function (err) {
    if (err) {
        console.log(err);
    } else {
        console.log("initial success.");
        console.log("please enter `http://localhost:3000/admin` login website's backstage.");
    }
});
