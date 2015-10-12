/*
 * 站点配置信息
 * Author: x-web
 * Date: 4/10/2015
 */

module.exports = {

	// debug
	debug: true,

	// some key
	session_secret: 'ParknShop_Online_Mall',
	auth_cookie_name: 'ParknShop.com Online Mall',
	encrypt_key: 'ParknShop',

	// MongoDB config
	URL: 'mongodb://127.0.0.1:27017/ParknShop',
	DB: 'ParknShop',
	HOST: '127.0.0.1',
	PORT: 27017,
	USERNAME: '',
	PASSWORD: '',


	// 站点基础信息
	SITE_TITLE: 'PARKnSHOP.com Online Mall',
	SITE_DOMAIN: '',
	SITE_ICP: '',
	SYSTEM_MAIL: '',
	SITE_DESCRIPTION: '',
	SITE_KEYWORDS: '',
	SITE_BASIC_KEYWORDS: '',

	// 系统管理模块
	SYSTEM_MANAGE: new Array('system', 'System Management'),
	ADMIN_USER_LIST: new Array('admin_user', 'Administrator Management'),
	ADS_LIST: new Array('ad', 'Ads Management'),
	BACKUP_MANAGE: new Array('data_log', 'Backup Management'),
	SYSTEM_LOGS: new Array('system_log', 'System Logs Management'),

	// 用户管理模块
	USER_MANAGE: {
		'user': new Array('user', 'Users Management'),
		'shop_owner': new Array('shop_owner', 'Shop Owner Management'),
		'customer': new Array('customer', 'Customer Management'),
		'blacklist': new Array('blacklist', 'Blacklist Management'),
	},



	// 目录
	UPDATE_FOLDER: process.cwd() + '/public/upload/',
	TEMPLATE_FOLDER: process.cwd() + '/views/web/temp/',
	DB_BACKUP_FOLDER: 'F:\\Program Files\\MongoDB\\ParknShop\\backup\\',
	DB_BACKUP_BAT: process.cwd() + '/models/db/bat/backup.bat',


	// 本地缓存（Redis）
	REDIS_HOST: '',
	REDIS_PORT: 6379,
	REDIS_PSD: '',
	REDIS_DB: 0
}
