var config = {
	port: 8000,
	paths: {
		app: '../app',
		appConfig: 'config.json',
		models: 'models',
		controllers: 'controllers',
		views: 'views',
		libraries: 'libraries'
	}
};

var Tik = function Tik() {
	
	global.tik = this;
	
	this.Class      = require('./tik.class.js');
	this.Basic      = require('./tik.basic.js');
	this.Request    = require('./tik.request.js');
	this.App        = require('./tik.app.js');
	
	this.Model      = require('./tik.model.js');
	this.Controller = require('./tik.controller.js');
	this.Library    = require('./tik.library.js');
	
	this.View       = require('./tik.view.js');

	this.MongoModel = require('./tik.mongomodel.js');
	
	this.config = config;
	
	if (!this.getApp()) {
		throw new Error('ERROR: Getting application failed', Tik.appName);
	}
	
};

Tik.prototype = {
	
	getApp: function() {
	
		var appPath = path.join(__dirname, config.paths.app),
			appConfigPath = path.join(appPath, config.paths.appConfig),
			appData;
			
		tik.log('Config found:', appConfigPath);
		
		try {
		
			fs.statSync(appConfigPath);
			appData = fs.readFileSync(appConfigPath, 'UTF-8');
			
			try {
				appData = JSON.parse(appData);
			} catch(e) {
				tik.error('app config file contains invalid JSON (run through JSONLINT!)');
				return false;
			}
			
		} catch(e) {
			if (e.code === 'ENOENT') {
				tik.error('Cannot locate app config file');
				return false;
			} else {
				throw e;
			}
		}
		
		this.app = new tik.App(appPath, appData);
		this.app.arrive();
		
		return true;
	
	},
	
	error: function() {

		var a = [].slice.call(arguments);
		a.unshift('[ERROR]');
		
		this.log.apply(this, a);

	},
	
	log: function() {
		
		var a = [].slice.call(arguments);
		a.unshift('Tik:: ');
		
		console.log.apply(console, a);
		
	}

};

global.http    = require('http');
global.fs      = require('fs');
global.url     = require('url');
global.util    = require('util');
global.path    = require('path');
global.events  = require('events');

// Make the tik
new Tik();

require('./tik.utils.js');

// Start the server
if (process.argv[2] && !isNaN(process.argv[2])) {
	config.port = process.argv[2];
}

http.createServer(function (req, res) {
	new tik.Request(req, res).route();
}).listen(config.port, '127.0.0.1');

tik.log('Running at http://127.0.0.1:' + config.port);
