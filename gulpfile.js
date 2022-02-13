const gulp = require('gulp')
// SCSS
const sass = require('gulp-sass')(require('sass'))
const concat = require('gulp-concat')
const cleancss = require('gulp-clean-css')
const autoprefixer = require('gulp-autoprefixer')
// TS
const browserify = require('browserify')
const tsify = require('tsify')
const source = require('vinyl-source-stream')
const uglify = require('gulp-uglify')
const buffer = require('vinyl-buffer')
const fancy_log = require('fancy-log')

// Live reloading
const browserSync = require('browser-sync').create()
// Common
const sourcemaps = require('gulp-sourcemaps')

// SCSS
function scss() {
	return gulp
		.src('./src/assets/css/app.scss')
		.pipe(sourcemaps.init())
		.pipe(
			sass({
				outputStyle: 'expanded',
			}).on('error', sass.logError)
		)
		.pipe(autoprefixer('last 2 versions'))
		.pipe(cleancss())
		.pipe(concat('bundle.min.css'))
		.pipe(sourcemaps.write('./'))
		.pipe(gulp.dest('./dist/assets/css'))
		.pipe(browserSync.stream())
}

// TS
function typescript() {
	return browserify({
		basedir: '.',
		debug: true,
		entries: ['./src/assets/js/app.ts'],
		cache: {},
		packageCache: {},
	})
		.plugin(tsify)
		.bundle()
		.on('error', fancy_log)
		.pipe(source('bundle.min.js'))
		.pipe(buffer())
		.pipe(sourcemaps.init({ loadMaps: true }))
		.pipe(uglify())
		.pipe(sourcemaps.write('./'))
		.pipe(gulp.dest('dist/assets/js'))
}

// Live reloading
function browserSyncInit(done) {
	browserSync.init(
		{
			server: {
				baseDir: './dist/',
			},
		},
		done
	)
}

function watch() {
	browserSyncInit()
	gulp
		.watch('./src/assets/css/**/*.scss', scss)
		.on('change', browserSync.reload)
	gulp
		.watch('./src/assets/js/**/*.ts', typescript)
		.on('change', browserSync.reload)
	gulp.watch('./dist/**/*.html').on('change', browserSync.reload)
}

// Order
exports.sass = scss
exports.typescript = typescript
exports.default = watch
