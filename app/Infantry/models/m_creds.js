/**********************************************************
*
* INFANTRY MODELS
* Creds Model Definition
*
* Authors: David DeRemer
*
**********************************************************/

// Set module imports
var mongoose = require('mongoose'),
		crypto = require('crypto'),
		_u = require('../util/underscore-extended');

// Set schema variables
var Schema = mongoose.Schema,
  	Mixed = Schema.Types.Mixed,
    ObjectId = Schema.ObjectId;




/**********************************************************
* Model Definition Function
**********************************************************/
exports.define = function (app, connection) {


	// Define available user types
	var userRoles = [
										'guest'
									, 'normal'
									, 'super'
									, 'admin'
									, 'partner'
									, 'partner-admin'
									, 'celebrity'
									];
	
	
	/**********************************************************
	* Embedded document schemas
	**********************************************************/

	// Define schemas to embed here
	// before using them in main model
		
		
	/**********************************************************
	* Schema definition 
	**********************************************************/

	var Cred = new Schema ({
	  								
	  modOn    		: { 	type : Number
	  								, required: true
	  								, validate: [_u.isFinite, 'modOn must be number']
	  								, 'default': Date.now()
	  							},			
		
		user    		: { 	type : ObjectId
	  								, required: true
	  								, ref: 'User'
	  							},			

	  un    			: { 	type : String
	  								, required : true
	  								, validate: [_u.isNotEmptyString, 'username must be non-empty string']
	  								, lowercase: true
	  							},
	  							
	  hash_pw    	: { 	type : String
	  								, required: true 
	  								, validate: [_u.isNotEmptyString, 'password must be non-empty string']
	  							},
	  							
	  							
	  salt				: { 	type : String
	  								, required: true 
	  								, validate: [_u.isNotEmptyString, 'salt must be non-empty string']
	  							},
	  							
	  active	    : { 	type : Boolean
	  								, required: true
	  								, 'default': true
	  							},
	  							
	  role	 			: {
	  									type : String
	  								, required: true
	  								, 'default' : 'normal'
	  								, enum: userRoles
	  							},
	  
	  token			: {
	  									type : String
	  								, required: true 
	  								, validate: [_u.isNotEmptyString, 'token must be non-empty string']
	  							},
	  
	  flags				: {
	  									type : {}
	  									// 'chgpw' : designates user needs to change password on next login
	  							},
	  							
	  services		: {
	  									type : []
	  							}							
	  
	});
	
	
	/**********************************************************
	* Indexes
	**********************************************************/

	Cred.index({ 'user': 1 }, {unique: true, safe: true});
	Cred.index({ 'un': 1 }, {unique: true, safe: true}); 
	Cred.index({ 'token': 1 }, {unique: true, safe: true}); 
	
	
	/**********************************************************
	* Virtuals and middleware
	**********************************************************/

	Cred.virtual('id')
	    .get(function() { return this._id.toHexString(); });
	
	Cred.virtual('password')
	  	.set(function(password) {
	    	this._password = password;
		    this.salt = this.makeSalt(this.user);
		    this.hash_pw = this.encryptPassword(password);
	  	})
	  	.get(function() { return this._password; });
	
	Cred.pre('save', function(next) {
	  this.modOn = Date.now()
	  next();
	});
	
	
	/**********************************************************
	* Methods: manipulate a record
	**********************************************************/
	
	Cred.method('makeSalt', function(seed) {
	  return Math.round((Date.now() * Math.random())) + seed;
	});
	
	Cred.method('encryptPassword', function(password) {
	  return crypto.createHmac('sha1', this.salt).update(password).digest('hex');
	});
	
	Cred.method('authenticate', function(plainText) {	
	  return this.encryptPassword(plainText) === this.hash_pw;
	});
	
	Cred.method('makeToken', function(seed) {	
		var tokenSalt = this.makeSalt(seed);
	 	return crypto.createHmac('md5', tokenSalt).digest('hex');
	});
	
	Cred.method('setupCred', function(uObj, callback) {
		if (_u.isObject(uObj)) {
			this.user = uObj.user;
			this.un = uObj.username;
			this.password = uObj.password;
			if (_u.has(uObj, 'role')) { this.role = uObj.role; }
			this.token = this.makeToken(uObj.username);
			this.flags = {};
			this.services = [];
			this.markModified('flags');
			this.markModified('services');
			this.save(function(err) {
				if (err) { callback(err); }
				else { callback(); }
			});
		} else { callback('Missing required field to create credential'); }
	});
	
	Cred.method('chgUn', function(un, callback) {
		if (!_u.isNotEmptyString(un)) { callback('Missing required field to change username'); }
		this.un = un;
		this.save(function(err) {
			if (err) { callback(err); }
			else { callback(); }
		});
	});
	
	Cred.method('chgPassword', function(pw, chgpw, callback) {
		if (!_u.isNotEmptyString(pw)) { callback('Missing required field to change password'); }
		else {
			this.password = pw;
			// Set chqpw flag if required, or remove it
			if (!_u.isObject(this.flags)) { this.flags = {}; }
			if (chgpw && chgpw == true) { this.flags.chgpw = true; }
			else if (this.flags.chgpw) { this.flags.chgpw = undefined; }
			this.markModified('flags');
			this.save(function(err) {
				if (err) { callback(err); }
				else { callback(); }
			});
		}
	});
	
	Cred.method('chgActive', function(callback) {
		this.active = !this.active;
		this.save(function(err) {
			if (err) { callback(err); }
			else { callback(); }
		});
	});
	
	Cred.method('chgRole', function(role, callback) {
		if (!_u.isNotEmptyString(role)) { callback('Missing required field to change role'); }
		else {
			this.role = role; 
			this.save(function(err) {
				if (err) { callback(err); }
				else { callback(); }
			});
		}
	});
	
	// Change the token
	Cred.method('chgToken', function(callback) {
		this.token = this.makeToken(this.un);
		this.save(function(err) {
			if (err) { callback(err); }
			else { callback(); }
		});		
	});
	
	// Add flags
	Cred.method('addFlags', function(flagsObj, callback) {
		_u.each(flagsObj, function(value, key) { if (!_u.isFunction(value)) { this.flags[key] = value; } });
		this.markModified('flags');
		this.save(function(err) {
			if (err) { callback(err); }
			else { callback(); }
		});		
	});
	
	// Remove flags
	Cred.method('remFlags', function(flagsObj, callback) {
		_u.each(flagsObj, function(value, key) { this.flags[key] = undefined; });
		this.markModified('flags');
		this.save(function(err) {
			if (err) { callback(err); }
			else { callback(); }
		});		
	});
	
	// Add Service
	Cred.method('addService', function(name, token, serviceObj, callback) {
		var self = this;
		this.remService(name, function(err) {
			if (err) { callback(err); }
			else {
				var newService = {};
				newService.name = name.toLowerCase();
				newService.token = token;
				newService.data = serviceObj;
				if (!_u.isArray(self.services)) { self.services = []; }
				self.services.push(newService);
				self.markModified('services');
				self.save(function(err) {
					if (err) { callback(err); }
					else { callback(); }
				});		
			} 
		});
	});
	
	// Change service
	Cred.method('chgService', function(name, token, serviceObj, callback) {
		_u.each(this.services, function(value, key) {
			if (value.name == name.toLowerCase()) {
				if (token) { value.token = token; }
				if (serviceObj) { value.data = serviceObj; }
			}
		});
		this.markModified('services');
		this.save(function(err) {
			if (err) { callback(err); }
			else { callback(); }
		});		
	});
	
	// Remove service
	Cred.method('remService', function(name, callback) {
		for (var i=0; i<this.services.length; i++) {
			if (this.services[i].name == name.toLowerCase()) {
				this.services.splice(i,1); 
				console.log('deleted service');
				break;
			}
		}
		this.markModified('services');
		this.save(function(err) {
			if (err) { callback(err); }
			else { callback(); }
		});		
	});
	
		
	/**********************************************************
	* Statics: manipulate a model
	**********************************************************/
	Cred.statics.get = function(query, callback) {
		this.find(query, {'hash_pw':0, 'salt': 0}, function(err, result) {
			if (err) { callback(err); }
			else { callback(null, result); }
		});
	}
	
	Cred.statics.getById = function(cId, uId, callback) {
		var qry,
				fields = { 'hash_pw':0, 'salt': 0 };
		if (cId) { qry = this.findById(cId, fields); }
		else if (uId) { qry = this.find({'user': uId}, fields); }
		if (qry) {
			qry.run(function(err, cred) {
				if (err) { callback(err); }
				else { callback(null, cred); }
			});		
		} else { callback('Nothing to query'); }	
	}	
	
	Cred.statics.validUn = function(un, callback) {
		// validate availability of a username
		this.count({'un' : un.toLowerCase()}, function(err, result) {
			if (err) { callback(err); }
			else { callback(null, result); }
		});
	};
	
	Cred.statics.chgUn = function(user, un, callback) {
		if (user && un) {
	 		this.findOne({'user':user}, function(err, result) {
				if (err) { callback(err); }
				else if (result) {
					result.chgUn(un, function(err) {
						if (err) { callback(err); }
						else { callback(null, result); }
					});
				} else { callback('Cred not found'); }
			});
		} else { callback('Missing required fields: user, un'); }
	};
	
	Cred.statics.chgPassword = function(user, pw, chgpw, callback) {
		if (user && pw) {
			this.findOne({'user':user}, function(err, result) {
				if (err) { callback(err); }
				else if (result) {
					result.chgPassword(pw, chgpw, function(err) {
						if (err) { callback(err); }
						else { callback(null, result); }
					});
				} else { callback('Cred not found'); }
			});
		} else { callback('Missing required fields: user, pw'); }
	};
	
	Cred.statics.chgActive = function(user, callback) {
		if (user) {
			this.findOne({'user':user}, function(err, result) {
				if (err) { callback(err); }
				else if (result) {
					result.chgActive(function(err) {
						if (err) { callback(err); }
						else { callback(null, result); }
					});
				} else { callback('Cred not found'); }
			});
		} else { callback('Missing required fields: user'); }
	};
	
	Cred.statics.chgRole = function(user, role, callback) {
		if (user && role) {
			this.findOne({'user':user}, function(err, result) {
				if (err) { callback(err); }
				else if (result) {
					result.chgRole(function(err) {
						if (err) { callback(err); }
						else { callback(null, result); }
					});
				} else { callback('Cred not found'); }
			});
		} else { callback('Missing required fields: user, role'); }
	};
	
	
	Cred.statics.chgToken = function(user, callback) {
		if (user) {
			this.findOne({'user':user}, function(err, result) {
				if (err) { callback(err); }
				else if (result) {
					result.chgToken(function(err) {
						if (err) { callback(err); }
						else { callback(null, result); }
					});
				} else { callback('Cred not found'); }
			});
		} else { callback('Missing required fields: user'); }
	};
	
	Cred.statics.addFlags = function(user, flagsObj, callback) {
		if (user && flagsObj) {
			this.findOne({'user':user}, function(err, result) {
				if (err) { callback(err); }
				else if (result) {
					result.addFlags(flagsObj, function(err) {
						if (err) { callback(err); }
						else { callback(null, result); }
					});
				} else { callback('Cred not found'); }
			});
		} else { callback('Missing required fields: user, flagsObj'); }
	};
	
	Cred.statics.remFlags = function(user, flagsObj, callback) {
		if (user && flagsObj) {
			this.findOne({'user':user}, function(err, result) {
				if (err) { callback(err); }
				else if (result) {
					result.remFlags(flagsObj, function(err) {
						if (err) { callback(err); }
						else { callback(null, result); }
					});
				} else { callback('Cred not found'); }
			});
		} else { callback('Missing required fields: user, flagsObj'); }
	};
	
	Cred.statics.addService = function(user, name, token, sObj, callback) {
		if (user && name && token && sObj) {
			this.findOne({'user':user}, function(err, result) {
				if (err) { callback(err); }
				else if (result) {
					result.addService(name, token, sObj, function(err) {
						if (err) { callback(err); }
						else { callback(null, result); }
					});
				} else { callback('Cred not found'); }
			});
		} else { callback('Missing required fields: user, name, token, sObj'); }
	};
	
	Cred.statics.chgService = function(user, name, token, sObj, callback) {
		if (user && name && (token || sObj)) {
			this.findOne({'user':user}, function(err, result) {
				if (err) { callback(err); }
				else if (result) {
					result.chgService(name, token, sObj, function(err) {
						if (err) { callback(err); }
						else { callback(null, result); }
					});
				} else { callback('Cred not found'); }
			});
		} else { callback('Missing required fields: user, name, token or sObj'); }
	};
	
	Cred.statics.remService = function(user, name, callback) {
		if (user && name) {
			this.findOne({'user':user}, function(err, result) {
				if (err) { callback(err); }
				else if (result) {
					result.remService(name, function(err) {
						if (err) { callback(err); }
						else { callback(null, result); }
					});
				} else { callback('Cred not found'); }
			});
		} else { callback('Missing required fields: user, name'); }
	};
	
	
	/**********************************************************
	* Statics: return model
	**********************************************************/
	
	return connection.model('Cred', Cred);
}
