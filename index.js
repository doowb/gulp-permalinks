'use strict';

var path = require('path');
var through = require('through2');
var extend = require('extend-shallow');
var Permalinks = require('permalinks');

/**
 * Create a stream that creates a permalink for each file passing through based on the provided `structure`
 * and `options`. The new permalink is set on the `file.data.relative` to allow using in templates or other places.
 * By default, the `file.path` property will be updated using the new `file.data.relative` property.
 *
 * ```js
 * gulp.task('permalinks', function() {
 *   return gulp.src('path/to/posts/*.md')
 *     .pipe(permalinks('blog/:stem/index.html'))
 *     .pipe(gulp.dest('_gh_pages'));
 * });
 * ```
 * @param  {String}   `structure` permalink structure to use for each file. See [permalinks][] for more details.
 * @param  {Object}   `options` Additional options to pass to [permalinks][] and to control how files are handled in the stream.
 * @param  {Boolean}  `options.flush` When set to `true` the files will be pushed back onto the stream in the "flush" function to ensure that all files are updated before continuing. Defaults to `false`.
 * @param  {Boolean}  `options.update` When set to `false` the files' path property will not be updated with the new permalink. Defaults to `true`.
 * @param  {Object}   `options.permalinks` Optionally pass your own instance of [permalinks][].
 * @param  {Function} `fn` Optional function that will be passed the `file` as it comes through the stream. This allows a user to set custom properties on `file.data` to be available in the `structure`.
 * @return {Stream} Stream that can be used in a [gulp][] pipeline.
 * @api public
 */

module.exports = function(structure, options, fn) {
  if (!structure || typeof structure !== 'string') {
    throw new TypeError('expected "structure" to be a string');
  }

  if (typeof options === 'function') {
    fn = options;
    options = {};
  }

  var opts = extend({}, options);
  var permalinks = opts.permalinks || new Permalinks(options);

  return opts.flush ? flush() : passthrough();

  /**
   * This creates a stream that will handle each file and pass it directly through the stream.
   */

  function passthrough() {
    return through.obj(function(file, enc, next) {
      try {
        handle(file);
      } catch (err) {
        next(err);
        return;
      }
      next(null, file);
    });
  }

  /**
   * This creates a stream that will handle each file and store it on the `files` array, then
   * push each file back onto the stream in the flush function
   */

  function flush() {
    var files = [];
    return through.obj(function(file, enc, next) {
      try {
        handle(file);
      } catch (err) {
        next(err);
        return;
      }
      files.push(file);
      next();
    }, function(cb) {
      for (var i = 0; i < files.length; i++) {
        this.push(files[i]);
      }
      files = [];
      cb();
    });
  }

  /**
   * Handles a file coming through the stream by calling the user provided `fn` if available,
   * formatting the permalink and saving it on `file.data.relative`, then updating `file.path`
   * if `update !== false`.
   */

  function handle(file) {
    // ensure there is a `.data` property on `file`
    file.data = file.data || {};

    // pass file into user defined `fn`
    if (typeof fn === 'function') {
      fn(file);
    }

    // calculate permalink and store it on `file.data.relative`
    file.data.relative = permalinks.format(structure, file);

    // unless the user specifies `update = false` on `options` or `file.data`, update the `file.path`
    // with the new permalink
    var update = typeof file.data.update === 'boolean' ? file.data.update : opts.update;
    if (update !== false) {
      file.path = path.resolve(file.base, file.data.relative);
    }
  }
};
