**Default file properties**

This example uses somes of the default file properties calculated from the `file.path`.

```js
gulp.task('permalinks', function() {
  return gulp.src('path/to/posts/*.md')
    .pipe(permalinks('blog/:stem/index.html'))
    .pipe(gulp.dest('_gh_pages'));
});

// writes to '_gh_pages/blog/my-file-stem/index.html'
```

**Custom helpers**

This example registers some custom helpers by passing them into the plugin through the options object.

```js
gulp.task('permalinks', function() {
  var options = {
    helpers: {
      foo: function() {
        return this.context.stem.toUpperCase();
      },
      date: function() {
        return moment().format('YYYY/MM/DD');
      }
    }
  }

  return gulp.src('path/to/posts/*.md')
    .pipe(permalinks('blog/:date/:foo.html'))
    .pipe(gulp.dest('_gh_pages'));
});

// writes to '_gh_pages/blog/2017/02/15/MY-FILE-STEM.html'
```

**Custom presets**

This example registers some custom presets by passing them into the plugin through the options object.

```js
gulp.task('permalinks', function() {
  var options = {
    presets: {
      blog: 'blog/:stem/index.html'
    }
  };

  return gulp.src('path/to/posts/*.md')
    .pipe(permalinks('blog'))
    .pipe(gulp.dest('_gh_pages'));
});

// writes to '_gh_pages/blog/my-file-stem/index.html'
```

**Custom data**

This example registers some custom data by passing it into the plugin through the options object.

```js
gulp.task('permalinks', function() {
  var options = {
    data: {
      foo: 'bar',
      baz: 'qux'
    }
  };

  return gulp.src('path/to/posts/*.md')
    .pipe(permalinks('blog/:foo/:baz/:stem/index.html'))
    .pipe(gulp.dest('_gh_pages'));
});

// writes to '_gh_pages/blog/bar/qux/my-file-stem/index.html'
```
