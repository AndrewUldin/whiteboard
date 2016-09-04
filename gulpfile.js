'use strict';

const watchify = require('watchify');
const browserify = require('browserify');
const gulp = require('gulp');
const source = require('vinyl-source-stream');
const buffer = require('vinyl-buffer');
const sourcemaps = require('gulp-sourcemaps');
const sass = require('gulp-sass');
const reactify = require('reactify');
const babelify = require('babelify');
const uglify = require('gulp-uglify');
const postcss = require('gulp-postcss');
const autoprefixer = require('autoprefixer');
const cssnano = require('cssnano');
const series = require('run-sequence');
const svgmin = require('gulp-svgmin');
const htmlmin = require('gulp-htmlmin');
const del = require('del');

function buildScripts(watch, production) {
    if (production) {
        process.env.NODE_ENV = 'production';
    }

    let bundler = browserify('./clientside/dist/js/index.js', {
        basedir: __dirname,
        debug: !production,
        cache: {}, // required for watchify
        packageCache: {}, // required for watchify
        fullPaths: watch // required to be true only for watchify
    });
    if (watch) {
        bundler = watchify(bundler)
    }
    bundler.on('log', function(msg) { console.log(msg); });

    bundler.transform('babelify', { presets: ['es2015', 'react'] });
    bundler.transform(reactify);

    const rebundle = () => {
        let stream = bundler.bundle().on('error', function(err) { console.log(err.message) });
        stream = stream.pipe(source('index.js'));
        if (production) {
            stream = stream.pipe(buffer());
            stream = stream.pipe(uglify());
        }
        return stream.pipe(gulp.dest('./clientside/app/scripts'));
    };

    bundler.on('update', rebundle);
    return rebundle();
}

gulp.task('js', () => {
    return buildScripts(false);
});

gulp.task('js:build', () => {
    return buildScripts(false, true);
});

gulp.task('js:watch', done => {
    return buildScripts(true);
});

gulp.task('sass', () => {
    return gulp
        .src('./clientside/dist/sass/*.scss')
        .pipe(sourcemaps.init())
        .pipe(sass().on('error', sass.logError))
        .pipe(sourcemaps.write())
        .pipe(gulp.dest('./clientside/app/styles'));
});

gulp.task('sass:build', () => {
    return gulp
        .src('./clientside/app/styles/*.css')
        .pipe(postcss([
            autoprefixer({ browsers: ['last 1 version'] }),
            cssnano(),
        ]))
        .pipe(gulp.dest('./clientside/app/styles'));
});

gulp.task('sass:watch', done => {
    gulp.watch('./clientside/dist/sass/**/*.scss', ['sass']);
});

gulp.task('html', () => {
    return gulp
        .src('./clientside/dist/index.html')
        .pipe(gulp.dest('./clientside/app'));
});

gulp.task('html:build', () => {
    return gulp
        .src('./clientside/app/*.html')
        .pipe(htmlmin({ collapseWhitespace: true }))
        .pipe(gulp.dest('./clientside/app'));
});

gulp.task('html:watch', done => {
    gulp.watch('./clientside/dist/*.html', ['html']);
});

gulp.task('images', () => {
    return gulp
        .src('./clientside/dist/images/*')
        .pipe(gulp.dest('./clientside/app/images'));
});

gulp.task('images:watch', done => {
    gulp.watch('./clientside/dist/images/**/*', ['images']);
});

gulp.task('svgo', () => {
    return gulp
        .src('./clientside/app/images/*.svg')
        .pipe(svgmin())
        .pipe(gulp.dest('./clientside/app/images'));
});

gulp.task('cleanup', () => {
    return del([
        './clientside/app/*.html',       // html files
        './clientside/app/scripts/*',    // all js files
        './clientside/app/images/*',     // all images
        './clientside/app/styles/*',     // all styles
        '!./clientside/app/**/.gitkeep', // except .gitkeep files
    ]);
})

gulp.task('default', [
    'cleanup',
    'js:watch',
    'sass',
    'sass:watch',
    'html',
    'html:watch',
    'images',
    'images:watch'
]);

gulp.task('build', done => {
    series(
        'cleanup',
        'sass',
        'sass:build',
        'js:build',
        'images',
        'svgo',
        'html',
        'html:build',
        done
    );
});
