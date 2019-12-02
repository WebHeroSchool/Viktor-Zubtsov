const gulp = require('gulp'),
      sass = require('gulp-sass'),
      sourcemaps = require('gulp-sourcemaps'),
      pug = require('gulp-pug'),
      fontmin = require('gulp-fontmin'),
      browserSync = require("browser-sync"),
      debug = require('gulp-debug'),
      del = require('del'),
      cleanCSS = require('gulp-clean-css'),
      image = require('gulp-image'),
      minify = require('gulp-minify'),
      autoprefixer = require('gulp-autoprefixer'),
      spritesmith = require('gulp.spritesmith'),
     // concatCss = require('gulp-concat-css'),
      concat = require('gulp-concat');

//   1. directories
//   2. dev
//   3. build


//  1. directories

gulp.task('directories', function () {
  return gulp.src('*.*', {read: false})
    .pipe(gulp.dest('./src/css'))
    .pipe(gulp.dest('./src/img'))
    .pipe(gulp.dest('./src/img/sprite'))
    .pipe(gulp.dest('./src/fonts'))
    .pipe(gulp.dest('./src/js'))
    .pipe(gulp.dest('./src/modules'))
    .pipe(gulp.dest('./src/sass'))
    .pipe(gulp.dest('./src/sass/base'))
    .pipe(gulp.dest('./src/sass/layout'));
});

//  2. dev

gulp.task('pug', function() {
  return gulp.src("./src/index.pug")
    //  .pipe(pug({pretty: '\t'}))  // generate file pug
      .pipe(pug())
      .pipe(gulp.dest("./public"));
});


sass.compiler = require('node-sass');

gulp.task('sass', function () {
  return gulp.src('./src//sass/**/style.sass')
    .pipe(debug({title: 'src'}))
    .pipe(sourcemaps.init())  
    .pipe(sass().on('error', sass.logError))
    .pipe(debug({title: 'sass'}))
    .pipe(sourcemaps.write())
    .pipe(gulp.dest('./public/css'));
});

gulp.task('scripts', function() {
  return gulp.src('./src/js/*.js')
    .pipe(concat('index.js'))
    .pipe(gulp.dest('./public/js/'));
});

gulp.task('clean', function () {
  return del('./public');
});

gulp.task('fonts', function () {
  return gulp.src('src/fonts/*.ttf')
    .pipe(fontmin({
        text: 'text',
    }))
    .pipe(gulp.dest('./public/fonts'));
});

gulp.task('image', function () {
  return gulp.src('./src/img/*.png', './src/img/*.svg', './src/img/*.jpg')
    .pipe(image())
    .pipe(debug({title: 'image'}))
    .pipe(gulp.dest('./public/img'));
});

gulp.task('sprite', function() {
  var spriteData = 
      gulp.src('./src/img/sprite/*.*') 
          .pipe(spritesmith({
              imgName: 'sprite.png',
              cssName: '_sprite.sass',
              padding: 10,
              imgPath: '../img/sprite.png',
          }));

  spriteData.img.pipe(gulp.dest('./public/img')); 
  spriteData.css.pipe(gulp.dest('./src/sass/base')); 

  return spriteData;
});

gulp.task('relation', gulp.series (
  `clean`,
  gulp.parallel( `pug`, `sass`, 'scripts', 'fonts' , 'image', 'sprite')
));

gulp.task('watch', function () {
  gulp.watch(`./src/**/index.pug`, gulp.series(`pug`))
  gulp.watch(`./src/modules/*.pug`, gulp.series(`pug`))
  gulp.watch(`./src/sass/**/*.sass`, gulp.series(`sass`))
  gulp.watch(`./src/js/**/*.js`, gulp.series(`scripts`)) 
  gulp.watch(`./src/fonts/**/*.ttf`, gulp.series(`fonts`)) 
  gulp.watch(`./src/img/*`, gulp.series(`image`)) 
  gulp.watch(`./src/img/sprite/*`, gulp.series(`sprite`)) 
});

gulp.task('serve', function () {
  browserSync.init({
    server: `../ViktorZubtsov/public`
  });
  browserSync.watch(`../ViktorZubtsov/**/*.*`).on(`change`, browserSync.reload);
});

gulp.task('dev',
  gulp.series (`relation`, gulp.parallel(`watch`, 'serve')));

//  3. build

gulp.task('build-pug', function() {
  return gulp.src("./src/index.pug")
    .pipe(pug({pretty: '\t'}))  // generate file pug
    .pipe(pug())
    .pipe(debug({title: 'build-pug'}))
    .pipe(gulp.dest("./build"));
});

gulp.task('compress-sass', function () {
  return gulp.src('./src//sass/**/style.sass')
    .pipe(debug({title: 'src'}))
    .pipe(sass().on('error', sass.logError))
    .pipe(gulp.dest('./build/css'))
    .pipe(autoprefixer({
        cascade: false
  }))
  .pipe(cleanCSS({compatibility: 'ie8'}))
  .pipe(debug({title: 'compress-sass'}))
  .pipe(gulp.dest('./build/css'));
});
 
gulp.task('build-image', function () {
  return gulp.src('./src/img/*')
    .pipe(image())
    .pipe(debug({title: 'build-image'}))
    .pipe(gulp.dest('./build/img'));
});
  
gulp.task('compress-js', function() {
  return gulp.src(['./src/js/*.js', './src/js/*.mjs'])
    .pipe(concat('script.js'))
    .pipe(minify())
    .pipe(debug({title: 'compress-js'}))
    .pipe(gulp.dest('./build/js'));
});

gulp.task('build-fonts', function () {
  return gulp.src('src/fonts/*.ttf')
    .pipe(fontmin({
        text: 'text',
    }))
    .pipe(debug({title: 'build-fonts'}))
    .pipe(gulp.dest('./build/fonts'));
});

gulp.task('build-clean', function () {
  return del('./build')
});


gulp.task('build', gulp.series (
  `build-clean`,
  gulp.parallel(`build-pug`, `compress-sass`, 'build-image', 'compress-js', 'build-fonts')
));
