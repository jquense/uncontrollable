'use strict';
var gulp    = require('gulp')
  , less    = require('gulp-less')
  , rimraf  = require('rimraf')
  , plumber = require('gulp-plumber')
  , configs = require('./webpack.configs')
  , babelTransform = require('gulp-babel-helpers')
  , webpack = require('webpack')
  , WebpackDevServer = require("webpack-dev-server")
  , path = require('path');


gulp.task('clean', function(cb){
  rimraf('./lib', cb);
})

gulp.task('less-compile', ['clean'], function(){
  gulp.src('./src/less/styles.less')
      .pipe(plumber())
      .pipe(less({ compress: true }))
      .pipe(gulp.dest('./lib/styles'));
})

gulp.task('less-copy', ['clean'], function(){
  return gulp.src('./src/less/*.less')
    .pipe(gulp.dest('./lib/styles'))
})

gulp.task('transpile', ['clean'], function(){

  return gulp.src(['./src/**/*.jsx', './src/**/*.js'])
      .pipe(plumber())
      .pipe(babelTransform(
          configs.babel
        , './util/babelHelpers.js'
        , './lib/util/babelHelpers.js'))
      .pipe(gulp.dest('./lib'));
})

gulp.task('dev', function() {

  new WebpackDevServer(webpack(configs.dev), {
    publicPath: "/dev",
    hot: true,
    stats: { colors: true }
  })
  .listen(8080, 'localhost', function (err, result) {
    if (err) 
      return console.log(err);
    
    console.log('Listening at localhost:8080');
  });

})

gulp.task('release', ['clean', 'less-compile', 'less-copy', 'transpile'])


gulp.task('publish', ['release'], require('jq-release'))