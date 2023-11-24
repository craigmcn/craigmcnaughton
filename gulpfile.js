import { readFileSync } from 'fs'
import path from 'path'
import gulp from 'gulp'
import gulpif from 'gulp-if'
import hash from 'gulp-hash'
import rewrite from 'gulp-rev-rewrite'
import parseArgs from 'minimist'
import browserSyncCreate from 'browser-sync'
import postcss from 'gulp-postcss'
import autoprefixer from 'autoprefixer'
import tailwindcss from 'tailwindcss'
import purgecss from 'gulp-purgecss'
import cleancss from 'gulp-clean-css'
import rename from 'gulp-rename'
import browserify from 'browserify'
import babelify from 'babelify'
import source from 'vinyl-source-stream'
import buffer from 'vinyl-buffer'
import sourcemaps from 'gulp-sourcemaps'
import uglify from 'gulp-uglify'
import render from 'gulp-nunjucks-render'
import htmlmin from 'gulp-htmlmin'

const hashOptions = {
    template: '<%= name %>.<%= hash %><%= ext %>',
}
const hashFilename = 'hash-manifest.json'
const argv = parseArgs(process.argv.slice(2))
const env = argv.env ? argv.env : 'development'
const output = {
    development: './tmp',
    production: './dist',
}
const browserSync = browserSyncCreate.create()
const __dirname = path.resolve()

// CSS
gulp.task('css', function () {
    return gulp
        .src('./src/styles/index.css')
        .pipe(postcss([tailwindcss('tailwind.config.js'), autoprefixer()]))
        .pipe(
            gulpif(
                env === 'production',
                purgecss({
                    content: ['**/*.html'],
                    defaultExtractor: content => content.match(/[\w-/:]+(?<!:)/g) || [],
                }),
            ),
        )
        .pipe(gulpif(env === 'production', cleancss()))
        .pipe(rename('./css/styles.css'))
        .pipe(hash(hashOptions))
        .pipe(gulp.dest(output[env]))
        .pipe(
            hash.manifest(hashFilename, {
                deleteOld: true,
                sourceDir: __dirname + output[env].substring(1),
            }),
        )
        .pipe(gulp.dest(output[env]))
})

// JS
gulp.task('js', function () {
    const b = browserify({
        entries: 'src/scripts/scripts.js',
        debug: env === 'production',
    })

    return b
        .transform(
            babelify.configure({
                presets: ['@babel/preset-env'],
                sourceMaps: env === 'production',
            }),
        )
        .bundle()
        .pipe(source('js/scripts.js'))
        .pipe(buffer())
        .pipe(gulpif(env === 'production', sourcemaps.init({
            loadMaps: true,
        })))
        .pipe(gulpif(env === 'production', uglify()))
        .pipe(gulpif(env === 'production', sourcemaps.write('./')))
        .pipe(hash(hashOptions))
        .pipe(gulp.dest(output[env]))
        .pipe(
            hash.manifest(hashFilename, {
                deleteOld: true,
                sourceDir: __dirname + output[env].substring(1),
                append: true,
            }),
        )
        .pipe(gulp.dest(output[env]))
})

// Images
gulp.task('img', function () {
    return gulp.src('./src/img/**/*.+(jpg|jpeg|gif|png)')
        .pipe(gulp.dest(`${output[env]}/img`))
})

// Favicons
gulp.task('favicon', function () {
    return gulp.src('./src/favicons/*')
        .pipe(gulpif(env === 'production', gulp.dest(output[env])))
})

// HTML
gulp.task('html', function () {
    const manifest = readFileSync(`${output[env]}/${hashFilename}`)

    const manageEnvironment = function (environment) {
        environment.addFilter('json', function (value) {
            return JSON.parse(value) // convert the complete string imported by Nunjucks into JSON and return
        })
        // https://github.com/mozilla/nunjucks/issues/414
        // typeof for array, using native JS Array.isArray()
        environment.addFilter('isArray', value => Array.isArray(value))
    }

    return gulp.src('./src/pages/**/*.html')
        .pipe(render({
            path: ['src/templates'],
            manageEnv: manageEnvironment,
        }))
        .pipe(rewrite({
            manifest,
        }))
        .pipe(gulpif(env === 'production', htmlmin({
            collapseWhitespace: true,
        })))
        .pipe(gulp.dest(output[env]))
})

// Build
gulp.task('build', gulp.series('css', 'js', 'img', 'html', 'favicon'))

// Reload browser
gulp.task('reload', (done) => {
    browserSync.reload()
    done()
})

// Browser sync
gulp.task('browserSync', () => {
    browserSync.init({
        port: 3010,
        server: output[env],
        ui: false,
    })
    gulp.watch(
        ['src/styles/**/*.css', 'src/scripts/**/*.js', 'src/pages/**/*.html', 'src/templates/**/*.+(json|njk)'],
        gulp.series('build', 'reload'),
    )
})

// Dev server
gulp.task('serve', gulp.series('build', 'browserSync'))
