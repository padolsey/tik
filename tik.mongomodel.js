var mongodb = require('mongodb');

module.exports = tik.Model.extend({

	init: function (config) {

		console.log(this.__proto__);

		this._parent.call(this);

		this.config = {
			address: '127.0.0.1',
			port: 27017
		};

		if (config) {
			this.config = tik.utils.shallowMerge(this.config, config);
		}

		this.log('Config', this.config);

		this.server = new mongodb.Server(
			this.config.address,
			this.config.port,
			{}
		);

		if (!this.config.dbName) {
			this.error('DB: config.dbName (name) not defined');
			return;
		}

		if (!this.config.dbCollection) {
			this.error('DB: config.dbCollection (name) not defined');
			return;
		}

		this.db = new mongodb.Db(this.config.dbName, this.server, {});

		this.db.open(function(error, client){
			
			if (error) {
				this.error('DB: ' + this.config.db + ' error: ', error);
				return;
			}

			this.collection = new mongodb.Collection(client, this.config.dbCollection);

			this._isOpen = true;
			this.emit('open');

		}.bind(this));

	},

	find: function(selector, cb){
		if (this._isOpen) {
			
			this.collection.find(selector).toArray(cb);

		} else {
			var args = arguments;
			this.on('open', function(){
				this.find.apply(this, args);
			});
		}
	},

	insert: function(docs, ops, cb){
		if (this._isOpen) {

			this.collection.insert(docs, ops, cb);
			
		} else {
			var args = arguments;
			this.on('open', function(){
				this.insert.apply(this, args);
			});
		}
	},

	remove: function(selector, ops, cb){
		if (this._isOpen) {

			this.collection.remove(selector, ops, cb);
			
		} else {
			var args = arguments;
			this.on('open', function(){
				this.remove.apply(this, args);
			});
		}
	},

	update: function(selector, document, ops, cb){
		if (this._isOpen) {

			this.collection.update(selector, document, ops, cb);
			
		} else {
			var args = arguments;
			this.on('open', function(){
				this.update.apply(this, args);
			});
		}
	}
	
});