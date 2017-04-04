var gulp = require('gulp');
var less = require('gulp-less');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var autoprefixer = require('gulp-autoprefixer');
var cleanCSS = require('gulp-clean-css');
var notify = require('gulp-notify');
var responsive = require('gulp-responsive');
var argv = require('yargs').argv;

var exec = require('child_process').exec;

gulp.task('less', function(){

  var dir = './assets/less/';

  return gulp.src([ dir + 'reset.less',
                    dir + 'columns.less',
                    dir + 'styles.less',
                    dir + 'responsive.less'])
              .pipe(concat('styles'))
              .pipe(less())
              .pipe(autoprefixer({
                  browsers: ['last 2 versions'],
                  cascade: false
              }))
              .pipe(cleanCSS({compatibility: 'ie8'}))
              .pipe(gulp.dest( './assets/' ));
});


gulp.task('js', function(){

  var dir = './assets/js/';

  // jQuery, Vendor, Custom

  return gulp.src([dir + 'vendor/jquery-3.2.0.min.js',
                   dir + 'vendor/*.js',
                   dir + 'app.js' ])
          .pipe(concat('scripts.js'))
          .pipe(uglify())
          .pipe(gulp.dest( './assets/' ));
});


gulp.task('images', function () {

  exec('rm tt_images/web/*');

  return gulp.src('tt_images/originals/*.{jpg,png}')
    .pipe( responsive({
      '*': [{
        width: 500,
        rename: {
          suffix: '-500px',
          extname: '.jpg',
        },
        format: 'jpeg',
      }
      // ,{
      //   width: 1200,
      //   rename: {
      //     suffix: '-1200px',
      //     extname: '.jpg',
      //   },
      //   withoutEnlargement: true,
      // }
    ],
    }, {
      quality: 80,
      progressive: true,
      withMetadata: false,
      errorOnEnlargement: false,
    }))
    .pipe(gulp.dest('tt_images/web'));
});

gulp.task('default', ['less', 'js']);

gulp.watch('./assets/less/*.less', ['less']);
gulp.watch('./assets/js/*.js', ['js']);
