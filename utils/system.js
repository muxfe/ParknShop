/*
 * 系统相关工具类
 * Date: 11/10/2015
 */

// 文件压缩
var fs = require('fs');
var child = require('child_process');
var archiver = require('archiver');

var moment = require('moment');

var Db = require('../models/db/Db');
var settings = require('../models/db/settings');
var AdminUtils = require('./AdminUtils');

var System = {

    backup: function (req, res) {
        var date = new Date(),
            timestamp = moment(date).format('YYYYMMDDHHmmss').toString(),
            dataPath = settings.DB_BACKUP_FOLDER + timestamp,
            bat = settings.DB_BACKUP_BAT;

        if (!fs.existsSync(settings.DB_BACKUP_FOLDER)) {
            fs.mkdirSync(settings.DB_BACKUP_FOLDER);
        }
        if (fs.existsSync(dataPath)) {
            console.log('the backup file is already exists.');
            return;
        }
        fs.mkdir(dataPath, 0777, function (err) {
            if (err) {
                throw err;
            }

            var exec = child.exec,
                cmd = 'mongodump -o "' + dataPath + '"';

            fs.writeFile(bat, cmd, function (oerr) {
                if (oerr) {
                    console.log(oerr);
                    res.end('error');
                    return;
                }
                exec('call ' + bat, function (error, stdout, stderr) {
                    if (error) {
                        console.log(error);
                        res.end('error');
                        return;
                    }
                    console.log('backup success');
                    var filename = settings.DB_BACKUP_FOLDER + timestamp + '.zip',
                        output = fs.createWriteStream(filename),
                        archive = archiver('zip');

                    archive.on('error', function (err) {
                        throw err;
                    });
                    archive.pipe(output);
                    archive.bulk([
                        { src: [ dataPath + '\\**' ] }
                    ]);
                    archive.finalize();

                    // log
                    var logs = req.session.adminUserInfo.username + ' backup the data.';
                    AdminUtils.saveDataLog(filename, dataPath,  logs);
                    AdminUtils.saveSystemLog('backup', logs);

                    res.end('success');
                });
            }); // writeFile
        }); // mkdir
    }

};

module.exports = System;
