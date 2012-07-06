/**********************************************************
*
* INFANTRY
* A quick and easy way to add users to Express Apps
*
* Authors: David DeRemer
*
**********************************************************/

var _u = require('underscore'),
		mongoose = require('mongoose');




/**********************************************************
* INFANTRY CONSTRUCTOR
* 
* @param config 
* 	- 'app' : reference to Express app object
*		- 'dbUri' : URI to mongodb instance for user database
*
* @param options
*		- 'prefix' : path prefix for Infantry routes
*		- 'dashboard' : Boolean to show/hide the user dashboard accessible at /user/dashboard
*		- 'notifyPath' : path to redirect user to following initial creation (e.g., to send welcome email)
*		- 'forgotPath' : path to redirect user to following forgot un/pw inquiry
*
**********************************************************/
var Infantry = function(config, options) {
	if (_u.isEmpty(config) || !_u.has(config, 'app') || !_u.has(config, 'dbUri')) { throw new Error('Invalid Config Object'); }
	else {
	
		// Set config
		this.app = config.app;
		this.dbUri = config.dbUri;
		
		// Set Options
		this.options = {};
		if (!_u.isEmpty(options)) {
			
			// prefix
			this.options.prefix = options.prefix || '';
			if (this.options.prefix.charAt(this.options.prefix.length-1) == '/') { this.options.prefix = this.options.prefix.slice(0, this.options.prefix.length-1); }
			if (this.options.prefix != '' && this.options.prefix.charAt(0) != '/') { this.options.prefix = '/' + this.options.prefix; }
			//dashboard
			if (options.dashboard) { this.options.dashboard = true; } else { this.options.dashboard = false; }
			// notifyPath
			if (options.notifyPath) {
				this.options.notifyPath = options.notifyPath;
				if (this.options.notifyPath != '' && this.options.notifyPath.charAt(0) != '/') { this.options.notifyPath = '/' + this.options.notifyPath; }
			}
			// forgotPath
			if (options.forgotPath) {
				this.options.forgotPath = options.forgotPath; 
				if (this.options.notifyPath != '' && this.options.notifyPath.charAt(0) != '/') { this.options.notifyPath = '/' + this.options.notifyPath; }
			}
		}
		
		// Initialize Mongo Connection
		this.connection = mongoose.createConnection(this.dbUri);
		
		// Mount INFANTRY MODELS AND ROUTES
		return require('./routes/routes.js').mount(this.app, this.options, require('./models/models.js').mount(this.app, this.connection));
	}
};



module.exports = Infantry;