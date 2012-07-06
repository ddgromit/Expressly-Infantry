/**********************************************************
*
* INFANTRY-EXPRESSLY TEST APP
* Sample node.js Express-based app to demonstrate Infantry
*
* Authors: David DeRemer
*
**********************************************************/

/*********************************************************
* Dependencies.
*********************************************************/

// Require modules
var url = require('url'),
		express = require('express'),
		async = require('async');


/*********************************************************
* Create & Configure Express
* (http://expressjs.com/)
*********************************************************/

// Create Express App
var app = express();

// Set config based on environment
app.configure('development', require('../config/environments/development.js'));
app.configure('testing', require('../config/environments/testing.js'));
app.configure('production', require('../config/environments/production.js'));
app.configure(require('../config/environments/all.js'));



/*********************************************************
* Mount Models & Routes
*********************************************************/

// Mount models and routes
require('./routes/routes.js').mount(app, require('./models/models.js').mount(app));



////////////////////////////////////////////
// Use Infantry User Management Module
////////////////////////////////////////////

var Infantry = require('./Infantry/infantry.js');
var iConfig = {'app': app, 'dbUri': 'mongodb://localhost/infantry'}; 
var iOptions = {'prefix': 'api/', 'dashboard': true, 'notifyPath': '/notify/newuser', 'forgotPath': '/notify/forgot'};
var infantry = new Infantry(iConfig, iOptions);

////////////////////////////////////////////
////////////////////////////////////////////




/*********************************************************
* Start Webserver
*********************************************************/

if (module.parent) { throw new Error('Oops! Not the parent!'); }
else {
	// Set port if dynamically allocated (e.g., by Heroku)
	var port = parseInt(process.env.PORT) || 3000;
	var dburl = url.parse(app.set('mongodb-uri'));
	var redisurl = url.parse(app.set('redisSession-uri'));
	
	////////////////////////////////////////////
	// Start listening!
	////////////////////////////////////////////
	app.listen(port, function(){
	
	  // Show startup messages
		console.log(app.set('name') + " listening on port: " + port);
		console.log('BASEURL: ' + app.set('baseurl'));
		console.log('MONGODB-URI: ' + dburl.hostname + ':' + dburl.port + dburl.pathname);
		console.log('REDIS-URI: ' + redisurl.hostname + ':' + redisurl.port);
		console.log('////////////////////////////////////////////////////////////');
	});
	
} 


/*********************************************************
* Module Exports.
*********************************************************/

// Set exports
module.exports = app;