/**********************************************************
*
* INFANTRY AUTH MIDDLEWARE
* Runs before routes to set user params
* Accepts array of role types to limit access to
*
* Authors: David DeRemer
*
**********************************************************/
var _u = require('underscore');
		
		

module.exports = function(m) {

	var self = this;
	
	this.getId = function(req, res, next) {
		if (req.params.id) {
			if (req.params.id.length != 24) { next('route'); }
			else {
				m.USERS.findById(req.params.id, function(err, user) {
					if (err) { next(err); }
					else {
						req.params.userObj = user;
						next();
					}
				});
			}
		} else { next('Missing user id param'); }
	};

	// Checks username and password to determine access
	this.chkUnAndPw = function(req, res, next) {
		if (_u.isNotEmptyString(req.param('username')) && _u.isNotEmptyString(req.param('password'))) {
			m.CREDS.find({'un': req.param('username').toLowerCase()}, function(err, cred) {
				if (err) { next(err); }
				else if (cred && _u.isArray(cred) && cred.length > 0) {
					if (cred.length > 1) { throw new Error('More than one record found for username'); }
					else { cred = cred[0]; }
					if (cred.authenticate(req.param('password'))) {
						if (cred.active === true) {
							req.session.uid = cred.user;
							req.session.un = cred.un;
							req.session.role = cred.role;
							req.session.token = cred.token;
							if (cred.flags) { req.session.flags = cred.flags; }
							next();
						} else { next('User is not active'); }
					} else { next('Incorrect password'); }
				} else { next('Username not found'); }
			});
		} else { next('Must provide password') }
	}

	// Checks token and sets session variables if valid user is found
	var chkToken = self.chkToken = function(req, res, next) {
		if (_u.isObject(req) && req.param('token')) {
			m.CREDS.findOne({'token': req.param('token')}, function(err, cred){
				if (err) { next(err); }
				else if (cred) {
					if (cred.active !== true) { next('User is not active'); }
					else {
						req.session.uid = cred.user;
						req.session.un = cred.un;
						req.session.role = cred.role;
						req.session.token = cred.token;
						if (cred.flags) { req.session.flags = cred.flags; }
						if (req.x.authenticate) {
							delete req.x.authenticate;
							if (cred.authenticate(req.param('password'))) { next(); }
							else {
								next('Incorrect password'); 
							}
						} else { next(); }
					} 
				} else { next('Invalid Token'); }
			});
		} else { next('Could not authorize: invalid request'); }
	};
	
	
	// Check token if it is present in the request
	this.chkOptionalToken = function(req, res, next) {
		if (req.param('token')) { chkToken(req, res, next); } else { next(); }
	};
	
	this.chkTokenAndPw = function(req, res, next) {
		if (_u.isNotEmptyString(req.param('password'))) {
			if (!_u.isObject(req.x)) { req.x = {}; }
			req.x.authenticate = true;
			chkToken(req, res, next);
		} else { next('Must provide password') }
	}
	
	
	// Check to see if user has the correct role to access the route
	this.chkAuth = function(roles) {
		return function(req, res, next) {
			chkToken(req, res, function(err) {
				if (err) { next(err); }
				else {
					if (roles && _u.isArray(roles) && roles.length > 0) {
						if (roles.indexOf(req.session.role) == -1) { next('Not Authorized'); }
					}
					next();
				}
			});	
		};
	};
};