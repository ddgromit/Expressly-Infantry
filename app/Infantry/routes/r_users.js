/**********************************************************
*
* INFANTRY USER Routes For App
*
**********************************************************/
var less = require('less'),
		fs = require('fs');


/*********************************************************
* Define Routes for App
* 	Use routes to define controllers
*		Make endpoints available
*		Define route access via middleware
*********************************************************/
var mount = function (app, options, controller) {

	var m = app.models;

	/* Middleware to check tokens to determine access level */
	var auth = new (require('../util/authorize'))(m);


	/* Infantry Dashboard */
	app.get(options.prefix + '/users/dashboard', function(req, res, next) {
		if (options.dashboard) {
			fs.readFile(__dirname + '/../views/dashboard.html', 'utf8', function(err, text){
				if (err) { next(err); }
				else { res.send(text.replace(/<domain>/gi, req.headers.host + options.prefix)); }
	    });
	   } else { res.send(404); }
	});

	
	/* Create, Get, Update, Delete User */

	// Create a new user
	app.put(options.prefix + '/users', auth.chkOptionalToken, controller.createUser); 
	
	// Get, update, delete user 'self'
	app.get(options.prefix + '/users', auth.chkToken, controller.getUser); 
	app.post(options.prefix + '/users', controller.updateUser); 
	app.del(options.prefix + '/users', auth.chkTokenAndPw, controller.deleteUser); 

	
	/* Login User */	
	
	// Search for users
	app.get(options.prefix + '/users/search', auth.chkToken, controller.searchUsers);
	
	// Check username availability
	app.get(options.prefix + '/users/username', controller.checkUsername);
	
	// Login a user, renew a token
	app.get(options.prefix + '/users/login', auth.chkUnAndPw, controller.login);
	app.post(options.prefix + '/users/login', auth.chkUnAndPw, controller.renewToken);
	
	// Change user's password
	//app.post(options.prefix + '/users/changepassword', controller.changePassword);
	
	// Handle forgot username
	//app.get(options.prefix + '/users/forgotusername', controller.forgotUsername);
	
	// Handle forgot password
	//app.get(options.prefix + '/users/forgotpassword', controller.forgotPassword);



	/* Service routes */
	
	// FOURSQUARE
	app.post(options.prefix + '/users/services/foursquare', auth.chkToken, controller.addFoursquare);
	/*app.del(options.prefix + '/users/services/foursquare', auth.chkToken, controller.deleteInstagram);*/
	app.get(options.prefix + '/users/services/foursquare/callback', controller.foursquareCallback);


	// INSTAGRAM
	app.post(options.prefix + '/users/services/instagram', auth.chkToken, controller.addInstagram);
	/*app.del(options.prefix + '/users/services/instagram', auth.chkToken, controller.deleteInstagram);*/
	app.get(options.prefix + '/users/services/instagram/callback', controller.instagramCallback);


	/* Meta routes for 'self' */

	//app.get(options.prefix + '/users/meta', controller.getMeta);
	//app.post(options.prefix + '/users/meta', controller.createMeta);
	//app.del(options.prefix + '/users/meta', controller.deleteMeta);
	
	
	
	/* Following routes for 'self' */

	// Get open follow requests
	//app.get(options.prefix + '/users/requests', controller.getRequests);
		
	// Deny a follow request
	//app.del(options.prefix + '/users/requests', controller.deleteRequests);
	
	// Get Follows/Followers
	//app.get(options.prefix + '/users/follows', controller.getFollows);
	//app.get(options.prefix + '/users/followers', controller.getFollowers);
	
	


	/* Get, Update, Delete Specific User */
	
	//app.get(options.prefix + '/users/:id', auth.getId, controller.getUser);
	//app.post(options.prefix + '/users/:id', auth.getId, auth.chkAuth(['admin']), controller.updateUser);
	//app.del(options.prefix + '/users/:id', auth.getId, controller.deleteUser);	
	
	
	
	/* Meta routes for specific user */

	//app.get(options.prefix + '/users/:id/meta', controller.getMeta);
	//app.post(options.prefix + '/users/:id/meta', controller.createMeta);
	//app.del(options.prefix + '/users/:id/meta', controller.deleteMeta);



	/* Following routes for specific user */
	
	// Create follow request from 'self' to specific user
	//app.post(options.prefix + '/users/:id/requests', controller.createRequests);
	
	// Take back follow request from 'self' to specific user
	//app.del(options.prefix + '/users/:id/requests', controller.deleteRequests);
	
	// Get Following for specific user
	//app.get(options.prefix + '/users/:id/follows', controller.getFollows);	

	// Approve a following request (create follow and delete request)
	//app.post(options.prefix + '/users/:id/follows', controller.createRequests);
	
	// Remove a follow
	//app.del(options.prefix + '/users/:id/follows', controller.createRequests);
	
	// Get Followers for specific user
	//app.get(options.prefix + '/users/:id/followers', controller.getFollowers);
	
	
};













/*********************************************************
* Module Exports.
*********************************************************/
exports.mount = mount;