/**********************************************************
*
* INFANTRY USER Controller
*
**********************************************************/

var mongoose = require('mongoose'),
		_u = require('../util/underscore-extended'),
		async = require('async'),
		qs = require('querystring');


// Include c


/*********************************************************
* Define Controller for App Route
*********************************************************/
var mount = function (app, options, m) {

	var user_base = new (require('./components/user_base'))(app, options, m);
	var user_services = new (require('./components/user_services'))(app, options, m);
	
	this.createUser = user_base.createUser;
	this.getUser = user_base.getUser;
	this.updateUser = user_base.updateUser;
	this.deleteUser = user_base.deleteUser;
	
	this.searchUsers = user_base.searchUsers;
	this.checkUsername = user_base.checkUsername;
	this.login = user_base.login;
	this.renewToken = user_base.renewToken;


	this.addFoursquare = user_services.addFoursquare;
	this.foursquareCallback = user_services.foursquareCallback;

	this.addInstagram = user_services.addInstagram;
	this.instagramCallback = user_services.instagramCallback;
	
	

		
	
	
};













/*********************************************************
* Module Exports.
*********************************************************/
exports.mount = mount;