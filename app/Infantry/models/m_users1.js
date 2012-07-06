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
    ObjectId = Schema.ObjectId,
    ObjectIdType = mongoose.Types.ObjectId;
    



/**********************************************************
* Model Definition Function
**********************************************************/
exports.define = function (app, connection) {

	var User1 = new Schema ({
	
		modOn    		: { 	type : Number
	  								, required: true
	  								, validate: [_u.isFinite, 'modOn must be number']
	  								, 'default': Date.now()
	  							},
	
		info    		: {
		
										'email'		: {
																	type : String
	  															, required: true
	  															, lowercase: true
																}
	  							},
	  photo				: {
								  	orig 			: { 	type: String 
								  								, validate: [_u.isNotEmptyString, 'orig must be non-empty string']
								  							},
								  	sizes 		: { 	type: [] 
								  							}
								  },
		'opts'		: {
	  								'followAuto' : { 	type: Boolean 
								  							}
	  							}

	});
	
	
	User1.index({ 'info.email': 1 }, {unique: true}); 
	
	
	User1.method('setup', function(uObj, callback) {
		this.info = {};
		this.info.email = uObj.email;
		this.save(function(err) {
			if (err) { callback(err); }
			else { callback(); }
		});
	});
	
	
	return connection.model('User1', User1);
};