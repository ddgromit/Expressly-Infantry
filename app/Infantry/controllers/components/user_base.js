var mongoose = require('mongoose'),
		_u = require('../../util/underscore-extended'),
		async = require('async'),
		qs = require('querystring')


/*********************************************************
* Base User Functions
*********************************************************/


module.exports = function(app, options, m) {


	////////////////////////////////////////////
	// CREATE A NEW USER
	////////////////////////////////////////////
	this.createUser = function(req, res, next) {
	
		
		var requiredFields = ['username', 'password', 'email'];
		var allowedCredFields = ['username', 'password', 'role'];
		var allowedUserInfoFields = ['fName', 'lName', 'fullName', 'email', 'city', 'state', 'country', 'postal', 'phone', 'gender', 'birthYear'];
		
		if (!_u.hasAllKeys(req.body, requiredFields)) { next('Missing required field'); }
		else {
			
			// Set up cred and user objects
			var credObj = {};
			var userObj = { 'info': {}, 'photo': {}, 'opts': {} };
			_u.each(req.body, function(value, key) {
				if (_u.isInArray(key, allowedCredFields) && _u.isNotEmptyString(value)) { credObj[key] = value; }
				if (_u.isInArray(key, allowedUserInfoFields) && _u.isNotEmptyString(value)) { userObj.info[key] = value; } 
			});
			
			if (req.files && req.files.photo && req.files.photo.size > 0) {
				// TODO something with photo here
				userObj.photo.orig = req.files.photo.name;
				userObj.photo.sizes = [req.files.photo.size];
			}
			
			if (_u.isNotEmptyString(req.body.followAuto)) {
				if (req.body.followAuto == 'true') { userObj.opts.followAuto = true; }
				if (req.body.followAuto == 'false') { userObj.opts.followAuto = undefined; }
			}
			if (req.body.optKeys && req.body.optValues) {
				var keys = _u.splitTrim(req.body.optKeys, ',');
				var values = _u.splitTrim(req.body.optValues, ',');
				if (keys.length == values.length) {
					for (var i=0, z=keys.length; i<z; i++) {
						if (_u.isNotEmptyString(keys[i]) && _u.isNotEmptyString(values[i])) { userObj.opts[keys[i]] = values[i]; } 
					}
				}
			}
			
			// If setting 'role' to something besides 'normal', user must provide token and be admin
			if (credObj.role && credObj.role != 'normal' && req.session && req.session.role != 'admin') { next('Not authorized to create user role'); }
			else {
		
				// Validate username is not taken, then create Cred and User
				m.CREDS.validUn(credObj.username, function(err, exists) {
					if (err) { next(err); }
					else if (exists) { next('Username already exists'); }
					else {
					
						var cred = new m.CREDS();
						var user = new m.USERS();
					
						// Set up user and cred
						async.series([
							function(n) {
								user.setupUser(userObj, function(err) {
									if (err) { n(err); }
									else { n(null, user); }
								});	
							},
							function(n) {
								credObj.user = user._id;
								cred.setupCred(credObj, function(err) {
									if (err) { n(err); }
									else { n(null, cred); }
								});
							} 
						], function(err, results) {
							if (err) {
								// If there's an error and Cred or User was created, remove cred/user if it exists
								async.parallel([
									function(n) {
										m.USERS.remove({'_id': user._id}, function(err, result) {
											if (err) { console.log(err) }
											n();
										});
									},
									function(n) {
										m.CREDS.remove({'_id': cred._id}, function(err, result) {
											if (err) { console.log(err) }
											n();
										});
									}
								], function() {
									// If user creation fails, return the original error
									next(err); 	
								});								
							
							} else {
								// Requery for cred and user to ensure accurate save
								async.parallel([
									function(n) { m.USERS.findById(user._id, n); },
									function(n) { m.CREDS.getById(cred._id, null, n); }
								], function(err, finalRes) {
									if (err) { next(err); }
									else {
										var returnObj = {'user': finalRes[0], 'cred': finalRes[1]};
										if (req.body.notify && req.body.notify == 'true' && options.notifyPath) {
											// If notify and path exists, redirect to endpoint with user data set to 'response' parameter
											res.redirect(options.notifyPath + '?' + qs.stringify({'response': JSON.stringify(returnObj)})); 
										} else {
											// Return the output as json
											req.infantry = returnObj;
											next();
										}
									}
								});
							}
						});					
					}
				});
			}	
		}
	};



	////////////////////////////////////////////
	// GET USER 'SELF'
	////////////////////////////////////////////
	this.getUser = function(req, res, next) {
		m.USERS.findById(req.session.uid, function(err, result) {
			if (err) { next(err); }
			else { 
				req.infantry = result;
				next();
			}
		});
	}	
	
	
	
	////////////////////////////////////////////
	// UPDATE USER 'SELF'
	////////////////////////////////////////////
	this.updateUser = function(req, res, next) {
		var allowedUserInfoFields = ['fName', 'lName', 'fullName', 'email', 'city', 'state', 'country', 'postal', 'phone', 'gender', 'birthYear'];
		var userObj = { 'info': {}, 'photo': {}, 'opts': {} };
		
		// Set up info fields
		_u.each(req.body, function(value, key) {
			if (_u.isInArray(key, allowedUserInfoFields) && _u.isNotEmptyString(value)) { userObj.info[key] = value; } 
		});
		
		// Set up photo fields
		if (req.files && req.files.photo && req.files.photo.size > 0) {
			// TODO something with photo here
			userObj.photo.orig = req.files.photo.name;
			userObj.photo.sizes = [req.files.photo.size];
		}
		
		// Setup option fields
		if (_u.isNotEmptyString(req.body.followAuto)) {
			if (req.body.followAuto == 'true') { userObj.opts.followAuto = true; }
			if (req.body.followAuto == 'false' || req.body.followAuto == 'undefined') { userObj.opts.followAuto = undefined; }
		}
		if (req.body.optKeys && req.body.optValues) {
			var keys = _u.splitTrim(req.body.optKeys, ',');
			var values = _u.splitTrim(req.body.optValues, ',');
			if (keys.length == values.length) {
				for (var i=0, z=keys.length; i<z; i++) {
					if (_u.isNotEmptyString(keys[i]) && _u.isNotEmptyString(values[i])) { userObj.opts[keys[i]] = values[i]; } 
				}
			}
		}
		
		// Get the user
		m.USERS.findById(req.session.uid, function(err, user) {
			// Check if user's email is their username
			var emailAsUn = req.session.un == user.info.email;
			
			if (err) { next(err); }
			else {
				// If fields to update, update the user, or return existing user
				if (!_u.isEmpty(userObj.info) || !_u.isEmpty(userObj.photo) || !_u.isEmpty(userObj.opts)) {
					async.series([
						function(n) {
							user.setupUser(userObj, function(err) { if (err) { n(err); } else { n(); } });
						},
						function(n) {
							// If the user is changing email and email is the username, then also change username
							if (userObj.info.email && _u.isNotEmptyString(userObj.info.email) && userObj.info.email != 'undefined' && emailAsUn) {
								m.CREDS.chgUn(user._id, userObj.info.email, function(err) { if (err) { n(err); } else { n(); } });
							} else { n(); }
						}
					], function(err, results) {
						if (err) { next(err); }
						else { 
							// Requery for cred and user to ensure accurate save
							async.parallel([
								function(n) { m.USERS.findById(user._id, n); },
								function(n) { m.CREDS.getById(null, user._id, n); }
							], function(err, finalRes) {
								if (err) { next(err); }
								else {
									var returnObj = {'user': finalRes[0], 'cred': finalRes[1]};
									req.infantry = returnObj;
									next();
								}
							});
						}
 					});
				}
			}
		});
	};	
	
	
	////////////////////////////////////////////
	// DELETE USER 'SELF'
	////////////////////////////////////////////
	this.deleteUser = function(req, res, next) {
		async.parallel([
			function(n) {
				m.USERS.remove({'_id': req.session.uid}, function(err, result) {
					if (err) { console.log(err) }
					n();
				});
			},
			function(n) {
				m.CREDS.remove({'user': req.session.uid}, function(err, result) {
					if (err) { console.log(err) }
					n();
				});
			}
		], function(err) {
			// If user creation fails, return the original error
			if (err) { next(err); }
			else {
				req.infantry = {'success': true}; 
				next();
			}
		});
	};	
	
	
	
	////////////////////////////////////////////
	// SEARCH USERS
	////////////////////////////////////////////	
	this.searchUsers = function(req, res, next) {
		// Request must contain at least one of: uID, fName, lName, phone, email, twitterID, limit
		var query = {},
				qry,
				limit,
				page;

	
		// Set search parameters
		if (_u.isNotEmptyString(req.param('uID'))) {
			var uidArray = _u.splitTrim(req.param('uID')); 
			if (uidArray.length > 1) {query._id = {'$in' : uidArray}; }
			else { query._id = uidArray[0]; }
		}
		if (_u.isNotEmptyString(req.param('fullName'))) { 
			var names = req.param('fullName').split(' ');
			if (names.length > 0) { 
				query['$or'] = [];	
				names.forEach(function(name) { query['$or'].push({'info.search' : new RegExp(name, "i")}); });
			}
		}
		if (_u.isNotEmptyString(req.param('city'))) { query['info.city'] = new RegExp(req.param('city'), "i"); }
		if (_u.isNotEmptyString(req.param('state'))) { query['info.state'] = new RegExp(req.param('state'), "i"); }
		if (_u.isNotEmptyString(req.param('postal'))) { query['info.postal'] = new RegExp(req.param('postal'), "i"); }
		if (_u.isNotEmptyString(req.param('country'))) { query['info.country'] = new RegExp(req.param('country'), "i"); }
		if (_u.isNotEmptyString(req.param('phone'))) { query['info.phone'] = new RegExp(req.param('phone'), "i"); }
		if (_u.isNotEmptyString(req.param('email'))) { query['info.email'] = new RegExp(req.param('email'), "i"); }
		
		// Set flags
		if (_u.isFinite(Number(req.param('limit'))) && req.param('limit') > 0) { limit = req.param('limit'); }
		if (_u.isFinite(Number(req.param('page'))) && req.param('page') > 0) { page = req.param('page'); }		
	
		if (_u.isEmpty(query)) { next('Missing search criteria to find users'); }
		else {
			qry = m.USERS.find(query);
			if (page > 0 && limit > 0) {
				qry.skip(limit * (page-1));
				qry.limit(limit);
			}
			qry.run(function(err, users) {
				if (err) { next(err); }
				else {
					req.infantry = users; 
					next();
				}
			});
		}
	};
	
	////////////////////////////////////////////
	// CHECK USERNAME EXISTS
	////////////////////////////////////////////	
	this.checkUsername = function (req, res, next) {
		// Checks to see if a username is available
		if (_u.isNotEmptyString(req.param('username'))) {
			m.CREDS.validUn(req.param('username'), function(err, result) {
				if (err) { next(err); }
				else if (result) {
					req.infantry = {'available' : false};
					next();
				} else { 
					req.infantry = {'available' : true};
					next();
				}
			});
		} else { next('Missing required field: username'); }
	}
	
	
	////////////////////////////////////////////
	// LOGIN USER
	////////////////////////////////////////////
	
	this.login = function (req, res, next) {
		if (_u.hasAllKeys(req.session, ['uid','un','role','token'])) {
			var returnObj = {};
			returnObj.user = req.session.uid;
			returnObj.un = req.session.un;
			returnObj.role = req.session.role;
			if (_u.has(req.session, 'flags')) { returnObj.flags = req.session.flags; }
			returnObj.token = req.session.token;
			
			// Return login info
			req.infantry = returnObj;
			
			next();
			
		} else { next('Invalid session'); }
	};
	
	this.renewToken = function (req, res, next) {
		if (_u.has(req.session, 'uid')) {
			m.CREDS.chgToken(req.session.uid, function(err, cred) {
				if (err) { next(err); }
				else {
					var returnObj = {};
					returnObj.user = cred.user;
					returnObj.un = cred.un;
					returnObj.role = cred.role;
					if (_u.has(cred, 'flags')) { returnObj.flags = cred.flags; }
					returnObj.token = cred.token;
			
					// Return login info
					req.infantry = returnObj;
					next();
					
				}
			});
		} else { next('Invalid session'); }
	};
	


}