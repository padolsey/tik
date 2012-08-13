module.exports = (function(){
	
	function CreateClass(definition, Base) {
		
		function Class(){}
		Class.prototype = CreateClass.prototype;
		
		var constructor =
			typeof definition == 'function' ? definition
				: definition.init || function(){
					this._parent.apply(this, arguments);
				};
		
		Base = Base || Class;
		constructor.prototype = extend.call( Object.create(Base.prototype), definition.prototype || definition );
		constructor.prototype.constructor = constructor;
		constructor.extend = function(definition){
			return new CreateClass(definition, constructor);
		};
		
		constructor.prototype._parent = Base;
	
		return constructor;

	}
	
	function extend(__proto__) {
		for (var key in __proto__) {
			if (hasOwnProperty.call(__proto__, key)) {
				this[key] = __proto__[key];
			}
		}
		return this;
	}
	
	return CreateClass;
	
}());