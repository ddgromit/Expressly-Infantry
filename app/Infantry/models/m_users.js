/**********************************************************
*
* INFANTRY MODELS
* Users Model Definition
*
* Authors: David DeRemer
*
**********************************************************/

// Set module imports
var mongoose = require('mongoose'),
		_u = require('../util/underscore-extended');

// Set schema variables
var Schema = mongoose.Schema,
  	Mixed = Schema.Types.Mixed,
    ObjectId = Schema.ObjectId;




/**********************************************************
* Model Definition Function
**********************************************************/
exports.define = function (app, connection) {


	
	/**********************************************************
	* Embedded document schemas
	**********************************************************/

	// Define schemas to embed here
	// before using them in main model
		
		
	/**********************************************************
	* Schema definition 
	**********************************************************/

	var User = new Schema ({
	  								
	  modOn    		: { 	type : Number
	  								, required: true
	  								, validate: [_u.isFinite, 'modOn must be number']
	  								, 'default' : Date.now()
	  							},
			
		info				:	{ 
	  								fName	 		: { 	type : String
	  														},
										lName	 		: { 	type : String 
																},
										search		: { 	type : [] 
																	, select : false
																	// Search is an array containing fName and lName for ease of name search
																},
										city	 		: { 	type : String
																},
										state	 		: { 	type : String
																},
										country	 	: { 	type : String
																},
										postal	 	: { 	type : String
																},
										phone	 		: { 	type : String 
																},
										email			: { 	type : String
																	, required  : true
																	, lowercase : true
																},
										gender	 	: { 	type : String
																	, enum : [ 'male', 'female', 'unknown' ] 
																},
										birthYear	: { 	type : Number
																}
									},
		
		photo				: {
								  	orig 			: { 	type: String 
								  								, validate: [_u.isNotEmptyString, 'orig must be non-empty string']
								  							},
								  	sizes 		: { 	type: [] 
								  							}
								  },
	  
	  opts				: {
	  								type : {}
	  							}
	  
	});
	
	
	/**********************************************************
	* Indexes
	**********************************************************/

	User.index({ 'info.email': 1 }, {unique: true, sparse: true, safe: true});
	User.index({ 'info.search': 1 });
	
	/**********************************************************
	* Virtuals and middleware
	**********************************************************/

	User.virtual('id')
	    .get(function() { return this._id.toHexString(); });

	User.virtual('fullName')
	  	.set(function(name) {
	  		var split = name.split(' ');
	  		var first = split.splice(0,1);
	  		var last = split.join(' ');
	    	this.set('info.fName', first);
	    	if (last != '') { this.set('info.lName', split.join(' '));}
	  	})
	  	.get(function() { return this.info.fName + ' ' + this.info.lName; });
	
	User.virtual('abbrName')
			.get(function() {
				var abbr = this.info.fName;
				if (this.info.lName && this.info.lName.length > 0) { abbr += ' ' + this.info.lName.charAt(0) + '.'; }
				return abbr; 
			});
	
	User.pre('save', function(next) {
	  this.modOn = Date.now();
	  this.info.search = [];
	  if (_u.isNotEmptyString(this.info.fName)) { this.info.search.push(this.info.fName); }
	  if (_u.isNotEmptyString(this.info.lName)) { this.info.search.push(this.info.lName); }
	  next();
	});
	
	
	/**********************************************************
	* Methods: manipulate a record
	**********************************************************/
	
	User.method('setupUser', function(uObj, callback) {
		var self = this;
		if (!_u.isObject(uObj)) { callback('Invalid parameter to setup user'); }
		else {
			// Set info fields
			if (_u.isObject(uObj.info)) {
				// If fullName is provided use it to set fName/lName. If fName/lName exist they will override
	    	if (_u.isNotEmptyString(uObj.info.fullName)) { this.fullName = uObj.info.fullName; }
	    	_u.each(uObj.info, function(value, key) {
	    		if (value == 'undefined' ) { self.info[key] = undefined; }
	    		else { self.info[key] = value; }
	    	});
	    }
	    // Set photo fields
	    if (_u.isObject(uObj.photo)) {
	    	_u.each(uObj.photo, function(value, key) {
	    		if (key == 'sizes') {
	    			if (_u.isArray(value)) { self.photo[key] = value; } 
	    			self.markModified('photo.sizes');
	    		} else { self.photo[key] = value; }
	    	}); 
	    }
	    // Set option fields
	    if (_u.isObject(uObj.opts)) {
	    	if (!_u.isObject(this.opts)) { this.opts = {}; }
	    	_u.each(uObj.opts, function(value, key) {
	    		if (!_u.isFunction(value)) {
	    			if (value == 'undefined' ) {
	    				self.opts[key] = undefined;  
	    			}
	    			else { self.opts[key] = value; }
	    		}
	    		self.markModified('opts.'+key);
	    	}); 
	    }
	    // Save new user
	    this.save(function(err) {
		  	if (err) { callback(err); }
		  	else { callback(); }
		  });
		}
	});
	
	
	User.method('addPhoto', function(orig, sizes, callback) {
		if (!_u.isNotEmptyString(orig)) { callback('Missing required field: orig'); }
		else {
			if (!_u.isObject(this.photo)) { this.photo = {}; }
			this.photo.orig = orig;
			if (_u.isArray(sizes)) {
				this.photo.sizes = sizes;
				self.markModified('photo.sizes');
			}		
			this.save(function(err) {
		  	if (err) { callback(err); }
		  	else { callback(); }
		  });
		}
	});
	
	
	User.method('addOptions', function(optObj, callback) {
		var self = this;
		if (!_u.isObject(optObj)) { callback('Missing required field: optObj'); }
		else {
			if (!_u.isObject(this.opts)) { this.opts = {}; }
			_u.each(uObj.opts, function(value, key) { self.opts[key] = value; })
			this.markModified('opts');
			this.save(function(err) {
		  	if (err) { callback(err); }
		  	else { callback(); }
		  });
		}
	});
	
	
	User.method('remOptions', function(optObj, callback) {
		if (!_u.isObject(optObj)) { callback('Missing required field: optObj'); }
		else {
			if (!_u.isObject(this.opts)) { this.opts = {}; }
			for (var key in uObj.opts) { this.opts[key] = undefined; }
			this.markModified('opts');
			this.save(function(err) {
		  	if (err) { callback(err); }
		  	else { callback(); }
		  });
		}
	});
	
		
	/**********************************************************
	* Statics: manipulate a model
	**********************************************************/
	
	User.statics.updateUser = function(uId, uObj, callback) {
		if (uId && uObj) {
			this.findById(uId, function(err, result) {
				if (err) { callback(err); }
				else if (result) { 
					result.setupUser(uObj, function(err) {
						if (err) { callback(err); }
						else { callback(null, result); }
					});
				} else { callback('User not found'); }
			});
		} else { callback('Missing required field'); }
	};
	
	User.statics.addPhoto = function(uId, orig, sizes, callback) {
		if (uId && orig && sizes) {
			this.findById(uId, function(err, result) {
				if (err) { callback(err); }
				else if (result) { 
					result.addPhoto(orig, sizes, function(err) {
						if (err) { callback(err); }
						else { callback(null, result); }
					});
				} else { callback('User not found'); }
			});
		} else { callback('Missing required field'); }
	};
	
	User.statics.addOptions = function(uId, optObj, callback) {
		if (uId && optObj) {
			this.findById(uId, function(err, result) {
				if (err) { callback(err); }
				else if (result) { 
					result.addOptions(optObj, function(err) {
						if (err) { callback(err); }
						else { callback(null, result); }
					});
				} else { callback('User not found'); }
			});
		} else { callback('Missing required field'); }
	};
	
	User.statics.remOptions = function(uId, optObj, callback) {
		if (uId && optObj) {
			this.findById(uId, function(err, result) {
				if (err) { callback(err); }
				else if (result) { 
					result.remOptions(optObj, function(err) {
						if (err) { callback(err); }
						else { callback(null, result); }
					});
				} else { callback('User not found'); }
			});
		} else { callback('Missing required field'); }
	};
	
			
	
	
	/**********************************************************
	* Statics: return model
	**********************************************************/
	
	return connection.model('User', User);
}
