'use strict';

require('mocha');
var assert = require('assert');
var Permalinks = require('permalinks');
var plugin = require('../');

describe('gulp-permalinks', function() {
  it('should export a function', function() {
    assert.equal(typeof plugin, 'function');
  });

  it('should throw an error when invalid args are passed', function(cb) {
    try {
      plugin();
      cb(new Error('expected an error'));
    } catch (err) {
      assert(err);
      assert.equal(err.message, 'expected "structure" to be a string');
      cb();
    }
  });

});
