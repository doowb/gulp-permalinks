'use strict';

require('mocha');
var path = require('path');
var vfs = require('vinyl-fs');
var assert = require('assert');
var Permalinks = require('permalinks');
var plugin = require('../');

var fixtures = path.join.bind(path, __dirname, 'fixtures');
var actual = path.join.bind(path, __dirname, 'actual');

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

  it('should return a stream', function() {
    var stream = plugin(':stem/index.html');
    assert.equal(typeof stream, 'object');
    assert.equal(typeof stream.on, 'function');
    assert.equal(typeof stream.pipe, 'function');
  });

  it('should pipe files through the stream and add `file.data.relative`', function(cb) {
    var files = [];
    vfs.src('*.md', {cwd: fixtures('posts')})
      .pipe(plugin(':stem/index.html'))
      .once('error', cb)
      .on('data', function(file) {
        files.push(file);
      })
      .once('end', function() {
        assert.equal(files.length, 3);
        assert.equal(files[0].data.relative, 'a/index.html');
        assert.equal(files[1].data.relative, 'b/index.html');
        assert.equal(files[2].data.relative, 'c/index.html');
        cb();
      });
  });

  it('should pipe files through the stream and update their `path` property', function(cb) {
    var files = [];
    vfs.src('*.md', {cwd: fixtures('posts')})
      .pipe(plugin('blog/:stem/index.html'))
      .once('error', cb)
      .on('data', function(file) {
        files.push(file);
      })
      .once('end', function() {
        assert.equal(files.length, 3);
        assert.equal(files[0].path, fixtures('posts', 'blog/a/index.html'));
        assert.equal(files[1].path, fixtures('posts', 'blog/b/index.html'));
        assert.equal(files[2].path, fixtures('posts', 'blog/c/index.html'));
        cb();
      });
  });

  it('should pipe files through the stream and not update their `path` property', function(cb) {
    var files = [];
    vfs.src('*.md', {cwd: fixtures('posts')})
      .pipe(plugin('blog/:stem/index.html', {update: false}))
      .once('error', cb)
      .on('data', function(file) {
        files.push(file);
      })
      .once('end', function() {
        assert.equal(files.length, 3);
        assert.equal(files[0].data.relative, 'blog/a/index.html');
        assert.equal(files[1].data.relative, 'blog/b/index.html');
        assert.equal(files[2].data.relative, 'blog/c/index.html');

        assert.equal(files[0].path, fixtures('posts/a.md'));
        assert.equal(files[1].path, fixtures('posts/b.md'));
        assert.equal(files[2].path, fixtures('posts/c.md'));
        cb();
      });
  });

  it('should pipe files through the stream and use the `fn` on each file', function(cb) {
    var files = [];
    vfs.src('*.md', {cwd: fixtures('content')})
      .pipe(plugin('archives/:YYYY/:MM/:DD/:stem/index.html', function(file) {
        var m = /((\d{4})-(\d{2})-(\d{2})-)/.exec(file.stem);
        if (!m) return;
        file.data.YYYY = m[2];
        file.data.MM = m[3];
        file.data.DD = m[4];
        file.stem = file.stem.replace(m[0], '');
      }))
      .once('error', cb)
      .on('data', function(file) {
        files.push(file);
      })
      .once('end', function() {
        assert.equal(files.length, 3);
        assert.equal(files[0].data.relative, 'archives/2017/01/02/a/index.html');
        assert.equal(files[1].data.relative, 'archives/2017/02/01/b/index.html');
        assert.equal(files[2].data.relative, 'archives/2017/02/14/c/index.html');

        assert.equal(files[0].path, fixtures('content', 'archives/2017/01/02/a/index.html'));
        assert.equal(files[1].path, fixtures('content', 'archives/2017/02/01/b/index.html'));
        assert.equal(files[2].path, fixtures('content', 'archives/2017/02/14/c/index.html'));
        cb();
      });
  });
});
