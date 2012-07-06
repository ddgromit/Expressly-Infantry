var mongoose = require('mongoose'),
		_u = require('../../util/underscore-extended'),
		request = require('request'),
		passport = require('passport'),
		FoursquareStrategy = require('passport-foursquare').Strategy,
		InstagramStrategy = require('passport-instagram').Strategy,
		LocalStrategy = require('passport-local').Strategy,
		async = require('async'),
		qs = require('querystring');


/*********************************************************
* Service Authentication Functions
*********************************************************/
module.exports = function(app, options, m) {


	//////////////////////////////////////////////////////////
	// FOURSQUARE Strategy
	//////////////////////////////////////////////////////////

	passport.use(new FoursquareStrategy({
	    clientID: app.set('services').foursquare.client_id,
	    clientSecret: app.set('services').foursquare.client_secret,
	    callbackURL: app.set('services').foursquare.callback_url
	  },
	  function(accessToken, refreshToken, profile, done) {
	    if (accessToken) {
	    	delete profile._json;
	    	delete profile._raw;
	  		var user = {'token': accessToken, 'refresh': refreshToken, 'profile': profile };
	  		return done(null, user);
	  	} else { return done('No Foursquare access token found'); }
	  }
	));

	// CONTROLLERS
	this.addFoursquare = function(req, res, next) {
		passport.authenticate('foursquare')(req, res, next);
	};	
	
	this.foursquareCallback = function(req, res, next) {
		passport.authorize('foursquare', { failureRedirect: '/auth'}, function(err, user) {
			if (err) { next(err); }
			else {
				if (user.token && user.profile) {
					m.CREDS.addService(req.session.uid, 'foursquare', user.token, user.profile, function(err, cred) {
						if (err) { next(err); }
						else if (!cred) { next('User not found'); }
						else {
							req.infantry = cred;
							next();
						}
					});
				} else { next('Invalid foursquare user object'); }				
			}
		})(req, res);
	};




	//////////////////////////////////////////////////////////
	// INSTRAGRAM Strategy
	//////////////////////////////////////////////////////////

	passport.use(new InstagramStrategy({
	    clientID: app.set('services').instagram.client_id,
	    clientSecret: app.set('services').instagram.client_secret,
	    callbackURL: app.set('services').instagram.callback_url
	  },
	  function(accessToken, refreshToken, profile, done) {
	  	if (accessToken) {
	  		//delete profile._json;
	    	delete profile._raw;
	  		var user = {'token': accessToken, 'refresh': refreshToken, 'profile': profile };
	  		return done(null, user);
	  	} else { return done('No Instagram access token found'); }
	  }
	));
	
	// CONTROLLERS
	
	this.addInstagram = function(req, res, next) {
		passport.authenticate('instagram')(req, res, next);
	};	
	
	this.instagramCallback = function(req, res, next) {
		passport.authorize('instagram', { failureRedirect: '/auth'}, function(err, user) {
			if (err) { next(err); }
			else {
				if (user.token && user.profile) {
					m.CREDS.addService(req.session.uid, 'instagram', user.token, user.profile, function(err, cred) {
						if (err) { next(err); }
						else if (!cred) { next('User not found'); }
						else {
							req.infantry = cred;
							next();
						}
					});
				} else { next('Invalid instagram user object'); }				
			}
		})(req, res);
	};
	
	

	//////////////////////////////////////////////////////////
	// Configure LOCAL Strategy
	//////////////////////////////////////////////////////////

	/*
	passport.use(new LocalStrategy(
	  function(username, password, done) {
	  	
	  	// Find user for password
	  	if (_u.isNotEmptyString(username) && _u.isNotEmptyString(password)) {
				m.CREDS.findOne({'un': username.toLowerCase()}, function(err, cred) {
					if (err) { return done(err); }
					else if (!cred) { return done(null, false); }
					else { 
						// Validate password and that user is active
						if (cred.authenticate(password)) {
							if (cred.active === true) { return done(null, cred); }
							else { return done(null, false); }
						} else { return done(null, false); }
					}
				});
			} else { return done('Must provide password') }
	  	
	  }	
	));
	*/


};