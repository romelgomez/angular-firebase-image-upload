'use strict';

angular.module('moreFilters',[])
/**
 *  All first letters of each word will be capital letters.
 *
 *  EXAMPLE: {{ 'hello word' | capitalize }} // Hello Word
 *
 *  @param {String}
 *  @return {String}
 * */
  .filter('capitalize', [function() {
    return function(input) {
      return (!!input) ? input.replace(/([^\W_]+[^\s-]*) */g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();}) : '';
    };
  }])
/**
 * Slug or lispCase; All letters are downCased and spaces and specialChars are replaced by hyphens '-'.
 *
 * EXAMPLE: {{ 'Your best days are not behind you; your best days are out in front of you.' | slug }} // your-best-days-are-not-behind-you-your-best-days-are-out-in-front-of-you
 *
 * @param {String}
 * @return {String}
 * */
  .filter('slug', [function() {
    return function(input) {
      return (!!input) ? String(input).toLowerCase().replace(/[^a-zá-źA-ZÁ-Ź0-9]/g, ' ').trim().replace(/\s{2,}/g, ' ').replace(/\s+/g, '-') : '';
    };
  }])
/**
 * All special chars are replaced by spaces.
 * @param {String}
 * @return {String}
 * */
  .filter('noSpecialChars', [function() {
    return function(input) {
      return (!!input) ? String(input).replace(/[^a-zá-źA-ZÁ-Ź0-9]/g, ' ').trim().replace(/\s{2,}/g, ' ') : '';
    };
  }])
/**
 * Receives one string like: 'hello word' and return 'Hello word'
 * @param {String}
 * @return {String}
 */
  .filter('capitalizeFirstChar', [function() {
    return function(input) {
      return (!!input) ? input.trim().replace(/(^\w?)/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1);}) : '';
    };
  }])
/**
 * Add one more step before apply the 'date' filter of angular. The raw data is first passed through Date.parse(input) before apply the 'date' filter of angular.
 * The idea is get the integer format: Date.parse('2015-01-19 14:12:15') // 142169293500, before apply the 'date' filter of angular.
 *
 *  EXAMPLE:
 *  var created = '2015-01-19 14:12:15';
 *  $scope.created = $filter('dateParse')(created,'dd/MM/yyyy - hh:mm a');
 *  {{created}} // 19/01/2015 - 02:12 PM
 *
 *  For more ifo see the API https://docs.angularjs.org/api/ng/filter/date
 *
 * @param  {String} Date Format '2015-01-19 14:12:15'
 * @return {String}
 */
  .filter('dateParse', ['$window','$filter',function($window,$filter) {
    return function(input,format,timezone) {
      return (!!input) ? $filter('date')( $window.Date.parse(input), format, timezone) : '';
    };
  }])
/**
 *  Replace part of the string.
 *
 *  EXAMPLE:
 *  var partOfTheUrl   = 'search-angular-filters';
 *  $scope.searchString   = $filter('stringReplace')(partOfTheUrl,'search-','');
 *  {{searchString}} // angular-filters
 *
 * @param  {String} Source string
 * @param  {String} Target string
 * @param  {String} New string
 * @return {String}
 * */
  .filter('stringReplace', [function() {
    return function(string,changeThis,forThis) {
      return string.split(changeThis).join(forThis);
    };
  }])
/**
 * receives one array like: [1,2,3] and return [3,2,1]
 * @param  {Array}
 * @return {Array}
 * */
  .filter('reverse', [function() {
    return function(items) {
      return angular.isArray(items)? items.slice().reverse() : [];
    };
  }])
/**
 * camelCase filter, receives one string like: 'hello word' and return 'helloWord'
 * @param  {String}
 * @return {String}
 * */
  .filter('camelCase', [function() {
    return function(input) {
      return  (!!input) ? input.trim().replace(/(?:^\w|[A-Z]|\b\w|\s+)/g, function(match, index) { if (+match === 0){ return ''; } return index === 0 ? match.toLowerCase() : match.toUpperCase(); }) : '';
    };
  }])
/**
 * lispCase To CamelCase, receives one string like: 'hello-word' and return 'helloWord'
 * @param  {String}
 * @return {String}
 */
  .filter('lispCaseToCamelCase', [function() {
    return function(input) {
      return  (!!input) ? input.trim().replace(/[\-_](\w)/g, function(match) { return match.charAt(1).toUpperCase(); }) : '';
    };
  }])
/**
 * AngularJS byte format filter
 * Source: https://gist.github.com/thomseddon/3511330
 */
  .filter('bytes', [function() {
    return function(bytes, precision) {
      if (isNaN(parseFloat(bytes)) || !isFinite(bytes)){ return '-'; }
      if (typeof precision === 'undefined'){ precision = 1; }
      var units = ['bytes', 'kB', 'MB', 'GB', 'TB', 'PB'],
        number = Math.floor(Math.log(bytes) / Math.log(1024));
      return (bytes / Math.pow(1024, Math.floor(number))).toFixed(precision) +  ' ' + units[number];
    };
  }]);
