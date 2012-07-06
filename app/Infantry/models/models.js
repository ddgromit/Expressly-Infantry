/**********************************************************
*
* INFANTRY
* Mongoose Model Loader
* http://mongoosejs.com/
*
**********************************************************/

// Require modules
var fs = require('fs'),
		async = require('async'),
		mongoose = require('mongoose');


/*********************************************************
* Mount models to App
*********************************************************/

var mount = function(app, connection) {
	var self = this;

	var modelNames = [];
	var models = {};
	
	// Get file names in current directory
	var files = fs.readdirSync( __dirname);
	if (files && files.length > 1) {
	
		// For each file,
		// ignore .DS_Store, get shortname, and call define function
		files.forEach(function(file) {
			if (file != 'models.js' && file != '.DS_Store') {
				var shortname = file.replace('m_','').replace('.js','').toUpperCase(); 
				modelNames.push(shortname);
				
				var model = require('./' + file); 
				models[shortname] = model.define(app, connection);
			}
		});
		
		console.log('INFANTRY Models Bound: ' + modelNames);
		return models;
		
	} else { console.log('INFANTRY No model files present'); }
};




/*********************************************************
* Module Exports.
*********************************************************/
exports.mount = mount;