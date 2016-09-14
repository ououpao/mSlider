'use strict';
const path = require('path')
const gulp = require('gulp')
const rename = require('gulp-rename')
const uglify = require('gulp-uglify')
const cleanCss = require('gulp-clean-css')

gulp.task('build', ['build-js', 'build-css'])

gulp.task('build-js', () => {
  gulp.src(path.join(__dirname, 'src/index.js'))
    .pipe(uglify())
    .pipe(rename('eSlider.min.js'))
    .pipe(gulp.dest(path.join(__dirname, 'dist')))
})

gulp.task('build-css', () => {
  gulp.src(path.join(__dirname, 'demo/app.css'))
    .pipe(cleanCss())
    .pipe(rename('eSlider.min.css'))
    .pipe(gulp.dest(path.join(__dirname, 'dist')))
})
