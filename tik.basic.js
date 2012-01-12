module.exports = tik.Class(events.EventEmitter).extend({

	init: function() {
		
	},

	log: function() {
		var args = [].slice.call(arguments);
		args.unshift('[App]');
		return tik.log.apply(tik, args);
	},

	error: function() {
		var args = [].slice.call(arguments);
		args.unshift('[App]');
		return tik.error.apply(tik, args);
	}
	
});