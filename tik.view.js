module.exports = tik.Class(events.EventEmitter).extend({

	init: function View(fullPath) {
		
		this._parent.call(this);
		
		this.templateCodeRegex = /~:(=)?(#)?(.+?):~/g;

		this.app = tik.app;
		
		this.fullPath = fullPath;

		this.get();
		
	},

	output: function(data) {
		data = data || {};
		data.views = this.app.views;
		return this.templateFn(data);
	},
	
	get: function() {
		
		this.template = fs.readFileSync(this.fullPath, 'UTF-8');
		this.createFn();
		
	},
	
	createFn: function() {

		var template = this.template,
			regex = this.templateCodeRegex,
			match,
			prevI = 0,
			nonCode,
			code,
			isPrint,
			isView,
			partialView,
			ret = [],
			fn;

		while (match = regex.exec(template)) {
	
			nonCode = template.substring(prevI, regex.lastIndex - match[0].length);
			isPrint = !!match[1];
			isView = !!match[2];
			code = match[3];

			if (isView) {
				code = 'views.' + code + '.output(data)';
				isPrint = true;
			}
			
			ret.push('s+=("' + nonCode.replace(/"/g,'\\"').replace(/[\r\n]/g, '\\\n\\n') + '");');
			ret.push(isPrint ? 's+=('+code+');' : code + ';');
	
			prevI = regex.lastIndex;
			
		}
	
		if (prevI < template.length) {
			// Push in last bit (not gained from loop)
			ret.push('s+=("' + template.substring(prevI).replace(/"/g,'\\"').replace(/[\r\n]/g, '\\\n\\n') + '");');
		}
	
		this.templateFn = new Function(
			'data',
			"var s = data.__output__ = '';with(data){" +
				ret.join('')
			+ "} return s;"
		);
		
	}
	
});

var ViewOutput = tik.Class(events.EventEmitter).extend({

	init: function(data, view) {

		this._parent.call(this);

		this.view = view;
		this.data = data;

	},

	output: function() {

		this.emit('write', this.view.templateFn(this.data));
		this.emit('end');
		
	}

});