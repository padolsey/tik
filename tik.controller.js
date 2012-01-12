var querystring = require('querystring'),
		formidable = require('formidable');

module.exports = tik.Basic.extend({

	init: function Controller(request, response) {
	
		console.log('>> :: Controller initiating');
		
		this.app = tik.app;
		this.models = this.app.models;
		this.controllers = this.app.controllers;
		this.views = this.app.views;
		
		this.request = request;
		this.response = response;

		if (request.method === 'POST') {
			this._grabRequestBody();
		}
	
	},

	_grabRequestBody: function() {
		
		var me = this,
				request = this.request,
				body = '';

		var form = new formidable.IncomingForm();

		form.parse(request, function(err, fields, files) {
			me.emit('formdata', {fields: fields, files: files});
		});

	},
	
	end: function(r) {
		this.response.end(r);
	},
	
	getView: function(name, cb) {
		
		if (!(name in this.views)) {
			tik.log('No views by name: ', name);
		}
		
		var view = this.views[name];
		
		view.controller = this;
		
		view.get();
		
		return view;
		
	},

	view: function(name, data) {
		
		if (!(name in this.views)) {
			tik.log('No views by name: ', name);
		}

		this.response.setHeader('Content-type', 'text/html');

		this.response.write(this.views[name].output(data));
		this.response.end();

	}
	
});