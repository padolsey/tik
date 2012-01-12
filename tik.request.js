module.exports = tik.Class({

	init: function Request(request, response) {
		
		this.app = tik.app;
	
		this.request = request;
		this.response = response;
	
	},
	
	route: function() {
		
		var routes = tik.routes,
			url = this.request.url,
			regex,
			match,
			controllerPath,
			split,
			cName,
			cMethod,
			controller;
		
		tik.log('Routing--', url);
		tik.log('Routes:', routes);
		
		for (var i = 0, l = routes.length; i < l; i++) {
			
			regex = RegExp(routes[i][0]);
			controllerPath = routes[i][1];

			if (!controllerPath) {
				tik.error('No controllerPath specified in route: ' + regex);
				continue;
			}
			
			if (match = url.match(regex)) {
				
				split = controllerPath.replace(/\$(\d+)/g, function($0, n) {
					return n in match ? match[n] : $0;
				}).split('.');
				
				cName = split[0];
				cMethod = split[1];
				
				break;
				
			}
			
		}
		
		if (cName) {
			
			tik.log('cName:', cName, 'cMethod:', cMethod);
			
			cMethod = cMethod || 'wild';
			
			if (cName in this.app.controllers) {
				
				controller = new this.app.controllers[cName](this.request, this.response);
				
				if (cMethod in controller) {
					controller[cMethod]( url.match(regex).splice(1), url );
				} else {
					tik.log('No method: ', cMethod, ' found in controller: ', cName);
					this.notFound();
				}
				
			} else {
				
				tik.log('Controller specified in route not found: ', cName);
				this.notFound();
				
			}
			
		} else {
			tik.log('No viable route found for URL');
			this.notFound();
		}
		
	},

	notFound: function() {
		this.response.writeHead(404, {'Content-type':'text/plain'});
		this.response.end('Page not found. Sorry.');
	}
	
});