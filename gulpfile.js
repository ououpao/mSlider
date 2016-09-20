'use strict';
const path = require('path')
const gulp = require('gulp')
const rename = require('gulp-rename')
const uglify = require('gulp-uglify')
const cleanCss = require('gulp-clean-css')
const autoprefixer = require('gulp-autoprefixer')

gulp.task('build', ['build-js', 'build-css'])

gulp.task('build-js', () => {
  gulp.src(path.join(__dirname, 'src/index.js'))
    .pipe(uglify())
    .pipe(rename('mSlider.min.js'))
    .pipe(gulp.dest(path.join(__dirname, 'dist')))
})

gulp.task('build-css', () => {
  gulp.src(path.join(__dirname, 'demo/app.css'))
    .pipe(autoprefixer({
      browsers: ['last 3 versions'],
      cascade: false
    }))
    .pipe(cleanCss())
    .pipe(rename('mSlider.min.css'))
    .pipe(gulp.dest(path.join(__dirname, 'dist')))
})
