const {
    readFileSync
} = require('fs');
const gulp = require('gulp');
const gulpif = require('gulp-if');
const hash = require('gulp-hash');
const rewrite = require('gulp-rev-rewrite');
const hashOptions = {
    template: '<%= name %>.<%= hash %><%= ext %>'
};
const hashFilename = 'hash-manifest.json';
const argv = require('minimist')(process.argv.slice(2));
const env = argv.env ? argv.env : 'development';
const output = {
    development: './tmp',
    production: './dist'
};
const browserSync = require('browser-sync').create();

// CSS
gulp.task('css', function () {
    const postcss = require('gulp-postcss');
    const tailwindcss = require('tailwindcss');
    const purgecss = require('gulp-purgecss');
    const cleancss = require('gulp-clean-css');
    const rename = require('gulp-rename');

    return gulp
        .src('./src/styles/index.css')
        .pipe(postcss([tailwindcss('tailwind.config.js'), require('autoprefixer')]))
        .pipe(
            gulpif(
                env === 'production',
                purgecss({
                    content: ['**/*.html'],
                    defaultExtractor: (content) => content.match(/[\w-/:]+(?<!:)/g) || []
                })
            )
        )
        .pipe(gulpif(env === 'production', cleancss()))
        .pipe(rename('./css/styles.css'))
        .pipe(hash(hashOptions))
        .pipe(gulp.dest(output[env]))
        .pipe(
            hash.manifest(hashFilename, {
                deleteOld: true,
                sourceDir: __dirname + output[env].substring(1)
            })
        )
        .pipe(gulp.dest(output[env]));
});

// JS
const browserify = require('browserify');
const babelify = require('babelify');
const source = require('vinyl-source-stream');
const buffer = require('vinyl-buffer');
const sourcemaps = require('gulp-sourcemaps');
const uglify = require('gulp-uglify');

gulp.task('js', function () {
    const b = browserify({
        entries: 'src/scripts/scripts.js',
        debug: env === 'production'
    });

    return b
        .transform(
            babelify.configure({
                presets: ['@babel/preset-env'],
                sourceMaps: env === 'production'
            })
        )
        .bundle()
        .pipe(source('js/scripts.js'))
        .pipe(buffer())
        .pipe(gulpif(env === 'production', sourcemaps.init({
            loadMaps: true
        })))
        .pipe(gulpif(env === 'production', uglify()))
        .pipe(gulpif(env === 'production', sourcemaps.write('./')))
        .pipe(hash(hashOptions))
        .pipe(gulp.dest(output[env]))
        .pipe(
            hash.manifest(hashFilename, {
                deleteOld: true,
                sourceDir: __dirname + output[env].substring(1),
                append: true
            })
        )
        .pipe(gulp.dest(output[env]));
});

// Images
gulp.task('img', function () {
    return gulp.src('./src/img/**/*.+(jpg|jpeg|gif|png)')
        .pipe(gulp.dest(`${output[env]}/img`));
});

// Favicons
gulp.task('favicon', function () {
    return gulp.src('./src/favicons/*')
        .pipe(gulpif(env === 'production', gulp.dest(output[env])));
});

// HTML
gulp.task('html', function () {
    const render = require('gulp-nunjucks-render');
    const manifest = readFileSync(`${output[env]}/${hashFilename}`);
    const htmlmin = require('gulp-htmlmin');

    const manageEnvironment = function (environment) {
        environment.addFilter('json', function (value) {
            return JSON.parse(value); // convert the complete string imported by Nunjucks into JSON and return
        });
        // https://github.com/mozilla/nunjucks/issues/414
        // typeof for array, using native JS Array.isArray()
        environment.addFilter('isArray', value => Array.isArray(value));
    };

    return gulp.src('./src/pages/**/*.html')
        .pipe(render({
            path: ['src/templates'],
            manageEnv: manageEnvironment
        }))
        .pipe(rewrite({
            manifest
        }))
        .pipe(gulpif(env === 'production', htmlmin({
            collapseWhitespace: true
        })))
        .pipe(gulp.dest(output[env]));
});

// Build
gulp.task('build', gulp.series('css', 'js', 'img', 'html', 'favicon'));

// Reload browser
gulp.task('reload', (done) => {
    browserSync.reload();
    done();
});

// Browser sync
gulp.task('browserSync', () => {
    browserSync.init({
        port: 3010,
        server: output[env],
        ui: false
    });
    gulp.watch(
        ['src/styles/**/*.css', 'src/scripts/**/*.js', 'src/pages/**/*.html', 'src/templates/**/*.+(json|njk)'],
        gulp.series('build', 'reload')
    );
});

// Dev server
gulp.task('serve', gulp.series('build', 'browserSync'));
