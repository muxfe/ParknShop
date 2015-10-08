/*
 * 工具对象
 * Author: x-web
 * Date: 8/10/2015
 */


var SiteUtils = {

    // 设置cookie
    gen_session: function ( user, res ) {
        var auth_token = user._id + '$$$$';
        res.cookie(settings.auth_cookie_name, auth_token,
            { path: '/', maxAge: 1000 * 60 * 60 * 24, signed: true, httpOnly: true }); // cookie有效期 1 天
    }

}

module.exports = SiteUtils;
