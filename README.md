# PARKnSHOP.com Online Mall

# Develop Environment
* OS: Windows 8.1
* Develop Tools: Atom
* Server App: Node.js v0.12.4
* DB: MongoDB 3.0.3
* Test Tools: Firebug
* Version control Tools: GitHub
* GUI design tool: DevTool, Photoshop , Firebug
* Programming Language: CSS , JavaScript

# Getting Start
## Dependencies
* [MongoDb 3.0.3](https://www.mongodb.org/downloads)
* [NodeJS v0.12.4](https://nodejs.org/en/download/)

Install more than these version will be ok.

### Windows
Just download the `.msi` file, and click next.

### Linux
Compiling from source in your platform will ber better. e.g. Ubuntu 14.04.<br/>
```text
git clone https://github.com/nodejs/node.git
cd node
$ ./configure
$ make
$ [sudo] make install
```
[read more](https:/github.com/nodejs/node)<br/>
Build MongoDB Source, [https://docs.mongodb.org/manual/contributors/tutorial/build-mongodb-from-source](https://docs.mongodb.org/manual/contributors/tutorial/build-mongodb-from-source)<br/>
Install MongoDB on Ubuntu, [https://docs.mongodb.org/manual/tutorial/install-mongodb-on-ubuntu](https://docs.mongodb.org/manual/tutorial/install-mongodb-on-ubuntu)

### Other platform
Please do it yourself.

## Start mongod
Add mongod in your system PATH.
```
mongod --dbpath="F:\Program Files\MongoDB\ParknShop\db"
 --logpath="F:\Program Files\MongoDB\ParknShop\log\mongo.log"
```
If you don't set the system PATH, please run it in mongo's bin directory.<br/>
There is like this on Linux.
```
$ [sudo] service mongodb stop
$ mongod --dbpath /path/db
```

## Install Node Modules
```
cd ParknShop
npm update
```

## Edit Configure
in `model\db\settings.js`
```
// MongoDB config
URL: 'mongodb://127.0.0.1:27017/ParknShop',
DB: 'ParknShop',
HOST: '127.0.0.1',
PORT: 27017,
USERNAME: '',
PASSWORD: ''
```
Change it using your mongodb config.
```
DB_BACKUP_FOLDER: 'F:\\Program Files\\MongoDB\\ParknShop\\backup\\'
```
MongoDB data backup directory.
```
DB_BACKUP_BAT: process.cwd() + '/models/db/bat/backup.bat'
```
MongoDB backup script `.bat` file path. You shouldn't to change it.

## Init Project
When mongod running successfully,
```
cd ParknShop
node init
```

## Start Project
```
node bin\www
```
Open `http://localhost:3000/admin` in your browser. Using `admin / admin` login backstage. And open `http://localhost:3000/user/login#register` register a new account.
