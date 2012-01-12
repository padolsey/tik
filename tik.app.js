module.exports = new tik.Class({

	init: function App(basePath, config) {
	
		this.basePath = fs.realpathSync(basePath);

		this.routes = tik.routes = config.routes;
		
		this.models = tik.models = {};
		this.controllers = tik.controllers = {};
		this.libraries = tik.libraries = {};
		this.views = tik.views = {};
		
		tik.log('Application initiating:', basePath);
		
	},
	
	arrive: function() {
		
		this._load(
			path.join(this.basePath, tik.config.paths.models),
			this.models = {},
			this._classHandler
		);

		this._load(
			path.join(this.basePath, tik.config.paths.controllers),
			this.controllers = {},
			this._classHandler
		);

		this._load(
			path.join(this.basePath, tik.config.paths.libraries),
			this.libraries = {},
			this._classHandler
		);

		this._load(
			path.join(this.basePath, tik.config.paths.views),
			this.views = {},
			this._viewHandler
		);

		this._load(
			path.join(fs.realpathSync(__dirname), 'views'), // tik's views
			this.views.tik = {},
			this._viewHandler
		);
		
	},
	
	_load: function(fullPath, store, fileHandler, subPath) {
	
		var prospectiveFiles,
			stats,
			_subPath;
		
		try {
			prospectiveFiles = fs.readdirSync(fullPath);
		} catch(e) {
			if (e.code === 'ENOENT') {
				tik.error('No ' + fullPath + ' directory');
				return false;
			}
		}
		
		for (var f, i = -1, l = prospectiveFiles.length; ++i < l;) {
			
			stats = fs.statSync( path.join(fullPath, prospectiveFiles[i]) );

			_subPath = path.join(subPath, prospectiveFiles[i]);
			
			if (stats.isDirectory()) {
				this._load(
					path.join(fullPath, prospectiveFiles[i]),
					store,
					fileHandler,
					_subPath
				);
			} else {
				fileHandler.call(
					this,
					store,
					fullPath,
					prospectiveFiles[i],
					_subPath
				);
			}
			
		}
		
	},

	/**
	 * _viewHandler
	 */
	_viewHandler: function(store, viewPath, viewFileName, viewSubPath) {
		
		// Name is full filename minus extension
		var viewName = path.basename(viewFileName, path.extname(viewFileName)),
			
			storageObject = this._resolveParentObjectFromPath(
				store,
				viewSubPath
			);
		
		storageObject[viewName] = new tik.View( path.join(viewPath, viewFileName) );

	},

	/**
	 * _classHandler
	 */
	_classHandler: function(store, classPath, classFileName, subPathWithinClassDirectory) {
		
		// Name is full filename minus extension
		var className = path.basename(classFileName, path.extname(classFileName)),
			classNameCap = className.charAt(0).toUpperCase() + className.slice(1),

			storageObject = this._resolveParentObjectFromPath(
				store,
				subPathWithinClassDirectory
			),

			exports = require(
				path.join(classPath, classFileName)
			);
		
		if (classNameCap in exports) {
			storageObject[classNameCap] = storageObject[className] = exports[classNameCap];
		} else {
			tik.error('`' + classNameCap + '` not found in ' + classFileName);
		}

	},
	
	/**
	 * _resolveParentObjectFromPath
	 * This is to determine where a class will go.
	 * E.g. in `this.controllers`, or perhaps `this.controllers.admin`
	 * This is determined by the directory structure within /controllers/
	 */
	_resolveParentObjectFromPath: function(parent, path) {
		
		var c,
			split = path.split('/');
		
		split.pop(); // get rid of last item (actual filename)
		
		while (c = split.shift()) {
			parent = parent[c] = parent[c] || {};
		}
		
		return parent;
	
	}
	
});