//REMOVE Warning: possible EventEmitter memory leak detected
/*process.stdin.setMaxListeners(0);
process.stdout.setMaxListeners(0);
process.stderr.setMaxListeners(0);*/

var gulp = require('gulp'),
    notify = require('gulp-notify'),
    newer = require('gulp-newer'),
	concat = require('gulp-concat'),
	addsrc = require('gulp-add-src'),
	lbinclude = require('gulp-lb-include'),
    sass = require('gulp-sass'),
    sourcemaps = require('gulp-sourcemaps'),
    prettify = require('gulp-jsbeautifier'),
    purify = require('gulp-purifycss'),
    bless = require('gulp-bless'),
	css = require('gulp-mini-css'),
	imagemin = require('gulp-imagemin'),
    imageminJpegRecompress = require('imagemin-jpeg-recompress'),
    imageminPngQuant = require('imagemin-pngquant');

var paths = {
    //SOURCE FILES

    //HTML files
    origin_html_all: './Source/**/*.html',
    origin_html_files: './Source/*.html',
    origin_html_modules_files: './Source/assets/modules/*.html',
    // CSS files
    origin_css_files: './Source/css/*.css',
    // JS files
    origin_js_files: './Source/assets/js/*.js',
    origin_js_all_files: './Source/assets/js/**/*.{js,json,map}',
    // FONTS files
    origin_fonts_files: './Source/assets/fonts/*',
    // IMAGES files
    origin_images_files: './Source/assets/images/**/*.+(png|jpg|jpeg|gif|svg)',
    origin_cms_images_files: './Source/cms-media/**/*.+(png|jpg|jpeg|gif|svg)',
    //SASS files
    origin_scss_files: './Source/assets/scss/**/*.scss',
    origin_libs_files: './Source/assets/scss/libs/*.scss',

    //SOURCE DIRECTORIES
    origin: './Source/',
    origin_maps: './maps/',
    origin_fonts: './Source/assets/fonts/',
    origin_modules: './Source/assets/modules/',
    origin_scss: './Source/assets/scss/',
    origin_libs: './Source/assets/scss/libs/',
    origin_js: './Source/assets/js/',
    origin_images: './Source/assets/images/',
    origin_cms_images: './Source/cms-media/',
    
    //Release Directories
    release: './FinalRelease/',
    release_css: './FinalRelease/css/',
    release_js: './FinalRelease/assets/js/',
    release_fonts: './FinalRelease/assets/fonts/',
    release_images: './FinalRelease/assets/images/',
    release_cms_images: './FinalRelease/cms-media/',
    //Release Files
    release_html_files: './FinalRelease/*.html'
}

//Beautify CSS
gulp.task('prettifySCSS', function() {
    return gulp.src([paths.origin_scss_files, '!(styles)*.scss', '!(libs)*.scss', '!(fonts)*.scss'])
    .pipe(prettify({
        indent_level: 4
    }).on('error', function(error) {
        this.emit('end');
        notify({
            title: "prettifySCSS ERROR",
            message: "line " + error.line + " in " + "\n" + error.message
        }).write(error);
    }))
    .pipe(gulp.dest(paths.origin_scss));
});

//Beautify JS
gulp.task('prettifyJS', function() {
    return gulp.src(paths.origin_js_files)
    .pipe(newer(paths.origin_js))
    .pipe(prettify({
        indent_level: 4
    }).on('error', function(error) {
        this.emit('end');
        notify({
            title: "prettifyJS ERROR",
            message: "line " + error.line + " in " + "\n" + error.message
        }).write(error);
    }))
    .pipe(gulp.dest(paths.origin_js));
});

//Beautify HTML
gulp.task('prettifyHTML', function() {
    return gulp.src(paths.origin_html_files)
    .pipe(newer(paths.origin))
    .pipe(prettify({
        indent_level: 4
    }).on('error', function(error) {
        this.emit('end');
        notify({
            title: "prettifyHTML ERROR",
            message: "line " + error.line + " in " + "\n" + error.message
        }).write(error);
    }))
    .pipe(gulp.dest(paths.origin))
    .pipe(addsrc(paths.origin_html_modules_files))
    .pipe(newer(paths.origin_modules))
    .pipe(prettify({
        indent_level: 4
    }).on('error', function(error) {
        this.emit('end');
        notify({
            title: "prettifyHTMLModules ERROR",
            message: "line " + error.line + " in " + "\n" + error.message
        }).write(error);
    }))
    .pipe(gulp.dest(paths.origin_modules));
});


//PROJECT DEPLOY TASKS

//Deploy Minify and split CSS Tasks
gulp.task('DeploymentMinCSS', ['prettifySCSS'], function() {
	return gulp.src(paths.origin_css_files)
    .pipe(newer(paths.release_css + '(skin)*.css'))
    .pipe(bless().on('error', function(error) {
        this.emit('end');
        notify({
            title: "Bless ERROR",
            message: "line " + error.line + " in " + "\n" + error.message
        }).write(error);
    }))
    .pipe(css({
        processImport: false
    }).on('error', function(error) {
        this.emit('end');
        notify({
            title: "css-minify ERROR",
            message: "line " + error.line + " in " + "\n" + error.message
        }).write(error);
    }))
    .pipe(gulp.dest(paths.release_css));
});

//Copy Files Tasks
gulp.task('CopyFiles', ['prettifyJS'], function () {
    //Javascript Files
	return gulp.src(paths.origin_js_all_files)
    .pipe(newer(paths.release_js))
	.pipe(gulp.dest(paths.release_js))
    //Font Files
    .pipe(addsrc(paths.origin_fonts_files))
    .pipe(newer(paths.release_fonts))
	.pipe(gulp.dest(paths.release_fonts));
});

//Copy Favicon Tasks
gulp.task('CopyFavicon', function () {
    return gulp.src('./Source/*.ico')
    .pipe(newer(paths.release))
	.pipe(gulp.dest(paths.release));
});

//Copy Minify Images Tasks
gulp.task('CopyMinImages', function () {
    //Images
	return gulp.src(paths.origin_images_files)
    .pipe(newer(paths.release_images))
    // Caching images that ran through imagemin
    .pipe(imagemin({
        use: [
            imageminJpegRecompress({
                accurate: true,
                quality: 'veryhigh',
                min: 70,
                max: 70,
                subsample: 'disable',
                strip: true
            }),
            imageminPngQuant({
                quality: '92-92',
                speed: 5,
                nofs: true,
                floyd: 0
            })
        ]
    }).on('error', function(error) {
        this.emit('end');
        notify({
            title: "CopyMinImages ERROR",
            message: "line " + error.line + " in " + "\n" + error.message
        }).write(error);
    }))
    .pipe(gulp.dest(paths.release_images))
    //CMS Images
    .pipe(addsrc(paths.origin_cms_images_files))
    .pipe(newer(paths.release_cms_images))
    // Caching images that ran through imagemin
    .pipe(imagemin({
        use: [
            imageminJpegRecompress({
                accurate: true,
                quality: 'veryhigh',
                min: 70,
                max: 70,
                subsample: 'disable',
                strip: true
            }),
            imageminPngQuant({
                quality: '92-92',
                speed: 5,
                nofs: true,
                floyd: 0
            })
        ]
    }).on('error', function(error) {
        this.emit('end');
        notify({
            title: "CopyMinCMSImages ERROR",
            message: "line " + error.line + " in " + "\n" + error.message
        }).write(error);
    }))
    .pipe(gulp.dest(paths.release_cms_images));
});

//Replace Include Files
gulp.task('DeployHTMLFiles', ['prettifyHTML'], function () {
	return gulp.src(paths.origin_html_files)
    .pipe(newer(paths.release))
    .pipe(lbinclude().on('error', function(error) {
        this.emit('end');
        notify({
            title: "ReplaceIncludes ERROR",
            message: "line " + error.line + " in " + "\n" + error.message
        }).write(error);
    }))
    .pipe(prettify({
        indent_level: 4
    }).on('error', function(error) {
        this.emit('end');
        notify({
            title: "prettifyHTMLRelease ERROR",
            message: "line " + error.line + " in " + "\n" + error.message
        }).write(error);
    }))
    .pipe(gulp.dest(paths.release));
});


//WATCHER TASK

//Watcher SCSS Tasks
gulp.task('WatcherSASS', function () {
    return gulp.src(paths.origin_scss_files)
    .pipe(sourcemaps.init())
    .pipe(sass.sync().on('error', function(error) {
        this.emit('end');
        notify({
            title: "WatcherSASS ERROR",
            message: "line " + error.line + " in " + "\n" + error.message
        }).write(error);
    }))
    .pipe(sass({
        outputStyle: 'expanded'
    }))
    .pipe(sourcemaps.write(paths.origin_maps))
    .pipe(gulp.dest(paths.origin));
});

//Watcher Tasks
gulp.task('watchThis', function () {
    var watcher = gulp.watch(paths.origin_scss_files, ['WatcherSASS']);
    watcher.on('change', function (event) {
        console.log('Watching SASS...');
    });
});


//EXTRA TASKS

//Clean Unused CSS
gulp.task('CleanCSS', function() {
    return gulp.src([paths.origin_css_files, paths.origin + '!libs.css', paths.origin + '!fonts.css'])
    .pipe(purify([paths.origin_js_files, paths.origin_html_all], {
        rejected: true,
        whitelist: ['*js-*', '*ui-*', '*is-*']
    }).on('error', function(error) {
        this.emit('end');
        notify({
            title: "CleanUnusedCSS ERROR",
            message: "line " + error.line + " in " + "\n" + error.message
        }).write(error);
    }))
    .pipe(gulp.dest(paths.origin));
});

//serve with browser sync
gulp.task("Serve", function (cb) {
    browserSync = require('browser-sync');

    browserSync({
        notify: true,
        // Run as an https by setting 'https: true'
        // Note: this uses an unsigned certificate which on first access
        //       will present a certificate warning in the browser.
        https: false,
        // Informs browser-sync to proxy our Express app which would run
        // at the following location
        //proxy: 'localhost:' + port,
        port: 9000,
        open: false,
        //tunnel: true,
        browser: 'Chrome Canary',
        server: {
            baseDir: "./Source/",
            index: "index.html"
        }
    }, cb);

    process.on('exit', function () {
        browserSync.exit();
    });

    
     gulp.watch([
        './Source/**/*'
  ]).on('change', browserSync.reload);
});

//Default task 
gulp.task("default", ["ProjectInit"]);

//MAJOR TASKS
//Project Init
gulp.task('ProjectInit', [ 'WatcherSASS', 'watchThis' , 'Serve']);
//Project Deploy
gulp.task('ProjectDeploy', ['prettifyJS', 'prettifySCSS', 'prettifyHTML', 'DeploymentMinCSS', 'CopyFiles', 'CopyFavicon', 'CopyMinImages', 'DeployHTMLFiles'], function () {
    
});
//Clean Unused CSS
gulp.task('CleanUnusedCSS', ['CleanCSS']);