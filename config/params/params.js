/**********************************************************
* Environment Configuration Properties
*
**********************************************************/

//////////////////////////////////////////////////////////
// Global constants for app
//////////////////////////////////////////////////////////
var global =
	{
			'name'							: 'APP NAME'
		, 'website'						: 'http://www.appinfosite.com'
		, 'logo'							: ''
		, 'description'				: ''
		, 'attribution'				: ''
		, 'constants'					: {
																'earthRadiusKm' 			: 6367.5			//Source: WolframAlpha
															, 'radiusOfEarthInM' 		: 6367.5 * 1000
															, 'radiusOfEarthInMi' 	: 3956.6
															, 'radiusOfEarthInFt' 	: 3956.6 * 5280
														}
		, 'forever'						: {
																'max': 5
															, 'silent': false
															, 'minUptime': 1000
															, 'spinsleeptime': 1000
															, 'options': []
														}
	};


//////////////////////////////////////////////////////////
// Development environment properties
//////////////////////////////////////////////////////////
var dev =
	{
			'url' 							: 'http://www.appsite.com'
		, 'sessionSecret'			: 'randomString123'
		// Database connections
		, 'mongoStore' 				: 'mongodb://localhost/dbname'
		, 'redisSession' 			: 'redis://user:password@localhost:6379'
		, 'services'					: {
															'instagram': {
																  'client_id' 		: 'ac6173c69f0d4c2988e0ed94e2b97232'
																, 'client_secret'	: '95cd431586654ec6940f9c556753b581'
																, 'callback_url'	: 'http://localhost:3000/api/users/services/instagram/callback'
															},
															'foursquare': {
																  'client_id'			: 'GR5ZALQRGI23TJGXPECYPKXX4ZP05CUPA3WA5FPGQAYXDB5J'
																, 'client_secret'	: 'SP1KYYFQVUYUZ5IFDINPY5JVOSZPS3BGBSNVBMWIW4GGNIJA'
																, 'callback_url'	: 'http://localhost:3000/api/users/services/foursquare/callback'
															}
														}
	};
	
	
//////////////////////////////////////////////////////////
// Testing environment properties
//////////////////////////////////////////////////////////
var testing =
	{
			'url' 							: 'http://www.appsite.com'
		, 'sessionSecret'			: 'randomString123'
		// Database connections
		, 'mongoStore' 				: 'mongodb://localhost/dbname'
		, 'redisSession' 			: 'redis://user:password@localhost:6379'
	};


//////////////////////////////////////////////////////////	
// Production environment properties
//////////////////////////////////////////////////////////
var production =
	{
			'url' 							: 'http://www.appsite.com'
		, 'sessionSecret'			: 'randomString123'
		// Database connections
		, 'mongoStore' 				: 'mongodb://localhost/dbname'
		, 'redisSession' 			: 'redis://user:password@localhost:6379'
	};



/*********************************************************
* Module Exports.
*********************************************************/

module.exports = {'global': global, 'dev': dev, 'testing': testing, 'production': production };

