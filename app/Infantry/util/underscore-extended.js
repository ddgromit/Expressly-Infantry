/**********************************************************
*
* EXTENDED VERSION OF UNDERSCORE
* Authors: David DeRemer
* http://documentcloud.github.com/underscore
* + mixins
*
**********************************************************/

// Require Underscore
var _u = require('underscore');




/**********************************************************
* Define Custom Functions
**********************************************************/

// Validate an object is not null or undefined
var exists = function(obj) {
	if (_u.isUndefined(obj) || _u.isNull(obj)) { return false; }
	return true;
}

// Split a common delimited string and remove any leading or trailing spaces
var splitTrim = function (str, delimiter) {
	var splitStr = str.split(delimiter || ',');
  for(var i=0;i<splitStr.length;i++) { splitStr[i] = splitStr[i].trim(); }
	return splitStr;
};

// Validate an object is a string, number, or boolean
var isSimpleData = function(obj) {
	if (exists(obj)) {
		if (_u.isString(obj)) { return true; }
		if (_u.isNumber(obj)) { return true; }
		if (_u.isBoolean(obj)) { return true; }
	}
	return false; 
}


// Check to see if a string is empty
var isNotEmptyString = function(str) {
	if (isSimpleData(str)) { return (str + '').length > 0; }
	return false;
}

// Check to see if string is of length, specified
// 'exact' means length must match exactly
var isStringOfLength = function(str, length, exact) {
	if (isNotEmptyString(str)) {
		if (exact) { return str.length == length; }
		else { return str.length >= length; }
	}
	return false;
}

// Check to Number is between two values (inclusive)
var isNumberBetween = function(num, first, last) {
	return (num >= first && num <= last);
}

// Check to see if object has all of the keys
// 'keys' is an array of strings that represent keys
var hasAllKeys = function(obj, keys) {
	if (_u.isObject(obj) && _u.isArray(keys) && keys.length > 0) {
		var hasAll = true;
		keys.forEach(function(key) { if (!_u.has(obj, key)) { hasAll = false; } });
		return hasAll;
	}
	return false;
}

// Check to see if value is present in array
var isInArray = function(val, array) {
	if (_u.isArray(array)) {
		return array.indexOf(val) != -1;
	}
	return false;
}


// Check to see if two objects are the same once converted to a string
var isMatch = function (a, b){
	if (a === undefined && b === undefined) { return true; }
	else if (a === undefined || b === undefined) { return false; }
	else { return a.toString() === b.toString(); } 
};


/**********************************************************
* Extended Underscore with mixins
**********************************************************/

_u.mixin(
	{
			'exists' : exists
		, 'splitTrim' : splitTrim
		, 'isSimpleData' : isSimpleData
		, 'isNotEmptyString' : isNotEmptyString
		, 'isStringOfLength' : isStringOfLength
		, 'isNumberBetween' : isNumberBetween
		, 'hasAllKeys' : hasAllKeys
		, 'isInArray' : isInArray
		, 'isMatch' : isMatch
	}
);



/**********************************************************
* Export Module
**********************************************************/
module.exports = _u;






/**********************************************************
* TESTS
**********************************************************/

/*
var write = function(expect, result) {
	var prefix = '    ';
	if (expect != result) { prefix = '!!! '; }
	console.log(prefix + expect + '->' + result); 
}
 

// Begin Writing Tests
console.log('');
console.log('');
console.log('/////////////////////////////////////////////////////');
console.log('Result format: Expected Result -> Actual Result');
console.log('/////////////////////////////////////////////////////');
console.log('');

//
// exists
//
console.log('————————————————————————————————————');
console.log('Exists');
console.log('————————————————————————————————————');
write(true, _u.exists('a'));
write(true, _u.exists(''));
write(true, _u.exists(1));
write(true, _u.exists(true));
write(true, _u.exists(new Date()));
write(true, _u.exists([]));
write(true, _u.exists([1,2]));
write(true, _u.exists(function(){}));
write(true, _u.exists({'hello': 'world'}));
write(false, _u.exists());
write(false, _u.exists(undefined));
write(false, _u.exists(null));
console.log('');


//
// isSimpleData
//
console.log('————————————————————————————————————');
console.log('isSimpleData');
console.log('————————————————————————————————————');
write(true, _u.isSimpleData('a'));
write(true, _u.isSimpleData(''));
write(true, _u.isSimpleData(1));
write(true, _u.isSimpleData(true));
write(false, _u.isSimpleData(new Date()));
write(false, _u.isSimpleData([]));
write(false, _u.isSimpleData([1,2]));
write(false, _u.isSimpleData(function(){}));
write(false, _u.isSimpleData({'hello': 'world'}));
write(false, _u.isSimpleData(function(){}));
write(false, _u.isSimpleData());
write(false, _u.isSimpleData(undefined));
write(false, _u.isSimpleData(null));
console.log('');


//
// isNotEmptyString
//
console.log('————————————————————————————————————');
console.log('isNotEmptyString');
console.log('————————————————————————————————————');
write(true, _u.isNotEmptyString('a'));
write(false, _u.isNotEmptyString(''));
write(true, _u.isNotEmptyString(1));
write(true, _u.isNotEmptyString(true));
write(false, _u.isNotEmptyString(new Date()));
write(false, _u.isNotEmptyString([]));
write(false, _u.isNotEmptyString([1,2]));
write(false, _u.isNotEmptyString(function(){}));
write(false, _u.isNotEmptyString({'hello': 'world'}));
write(false, _u.isNotEmptyString(function(){}));
write(false, _u.isNotEmptyString());
write(false, _u.isNotEmptyString(undefined));
write(false, _u.isNotEmptyString(null));
console.log('');


//
// isStringOfLength
//
console.log('————————————————————————————————————');
console.log('isStringOfLength');
console.log('————————————————————————————————————');
write(true, _u.isStringOfLength('a', 1));
write(true, _u.isStringOfLength('ab', 1));
write(true, _u.isStringOfLength('ab', 1), false);
write(true, _u.isStringOfLength('a', 1, true));
write(false, _u.isStringOfLength('ab', 1, true));
write(false, _u.isStringOfLength([], 1));
console.log('');


//
// hasAllKeys
//
console.log('————————————————————————————————————');
console.log('hasAllKeys');
console.log('————————————————————————————————————');
write(true, _u.hasAllKeys({'a':1, 'b': 2}, ['a','b']));
write(true, _u.hasAllKeys({'a':1, 'b': 2, 'c': 3}, ['a','b']));
write(false, _u.hasAllKeys({'a':1, 'b': 2}, ['a','b','c']));
write(false, _u.hasAllKeys());
write(false, _u.hasAllKeys({}, ['a']));
write(false, _u.hasAllKeys({'a':1}, []));
write(false, _u.hasAllKeys({'a':1, 'b': 2}, ['c', 'd']));
console.log('');

*/

