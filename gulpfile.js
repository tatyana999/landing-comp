"use strict";

var gulp = require('gulp'),
    watch = require('gulp-watch'),
    preFixer = require('gulp-autoprefixer'),
    ugLify = require('gulp-uglify'),
    sass = require('gulp-sass'),
    sourceMaps = require('gulp-sourcemaps'),
    rigger = require('gulp-rigger'),
    cssMin = require('gulp-clean-css'),
    rimRaf = require('rimraf'),
    browserSync = require('browser-sync'),
    //babel = require('gulp-babel'),
   // concat = require('gulp-concat'),
    pug = require ('gulp-pug'),
    svgSprite = require("gulp-svg-sprites"),
    imagemin = require('gulp-imagemin'),
    svgmin = require('gulp-svgmin'),
    cheerio = require('gulp-cheerio'),
    replace = require('gulp-replace'),
    reload = browserSync.reload;


var path = {
    build: {
        html:'build/',
        js:'build/js/',
        css:'build/css/',
        img: 'build/images/',
        svg:'build/images/',
        fonts: 'build/fonts/'
    },
    src: {
        html:'source/template/*.pug',
        js:'source/js/main.js',
        style:'source/style/main.scss',
        svg: 'source/image/*.svg',
        img:'source/image/**/*.*',
        fonts: 'source/fonts/**/*.*'
    },
    watch: {
        html:'source/**/*.pug',
        js: 'source/**/*.js',
        style: 'source/style/**/*.scss',
        img: 'source/image/**/*.*',
        fonts: 'source/fonts/**/*.*'
    },
    clean: './build'

};
//сервер
gulp.task('webServer', function(){
    browserSync({
        server: {
            baseDir: './build'
        },
        host: 'localhost',
        port: 3000,
        tunnel: true
    });
});
//html build
gulp.task('html:build', function(){
    return gulp.src('source/template/*.pug')
        .pipe(rigger())
        .pipe(pug({
            pretty:true
        }))
        .pipe(gulp.dest('build'))//сборка в папку build
        .pipe(reload({stream:true}));
});

//js build
gulp.task('js:build', function(){
   gulp.src(path.src.js) //поиск файла main
       .pipe(rigger())
       .pipe(sourceMaps.init())
       .pipe(ugLify())//минификация
       .pipe(gulp.dest(path.build.js))//запись в папку build
       .pipe(reload({stream: true}));//перезапуск local host

});

//css
gulp.task('style:build', function(){
    gulp.src(path.src.style) //поиск файла main
        .pipe(sourceMaps.init())
        .pipe(sass())//компиляция
        .pipe(preFixer())
        //.pipe(cssMin())//минификация
        .pipe(sourceMaps.write())
        .pipe(gulp.dest(path.build.css))//запись в папку build
        .pipe(reload({stream: true}));//перезапуск local host

});
//image
gulp.task('image', function(){
    gulp.src(path.src.img)
        .pipe(imagemin([
            imagemin.gifsicle({interlaced: true}),
            imagemin.jpegtran({progressive: true}),
            imagemin.optipng({optimizationLevel: 5}),
            imagemin.svgo({plugins: [{removeViewBox: true}]})
        ]))
        .pipe(gulp.dest(path.build.img))
        .pipe(reload({stream: true}));
});
//sprites
gulp.task('svgSpriteBuild', function () {
    return gulp.src(path.src.svg)
    // minify svg
        .pipe(svgmin({
            js2svg: {
                pretty: true
            }
        }))
        .pipe(cheerio({
            run: function ($) {
                $('[fill]').removeAttr('fill');
                $('[style]').removeAttr('style');
            },
            parserOptions: { xmlMode: false }
        }))
        // cheerio plugin create unnecessary string '>', so replace it.
        .pipe(replace('&gt;', '>'))
        // build svg sprite
        .pipe(svgSprite({
            mode: {
                symbol: {
                    sprite: "../sprite.svg",
                    render: {
                        scss: {
                            dest:'../../../sass/_sprite.scss',
                            template:  "sass/templates/_sprite_template.scss"
                        }
                    }
                }
            }
        }))
        .pipe(gulp.dest('build/sprite/'));
});
gulp.task('svgSprite', ['svgSpriteBuild', 'svgSpriteSass']);

//fonts
gulp.task('fonts', function() {
    gulp.src(path.src.fonts)
        .pipe(gulp.dest(path.build.fonts))
});
gulp.task('build', [
    'html:build',
    'js:build',
    'style:build',
    'fonts',
    'image',
    'svgSpriteBuild'
]);

//watch
gulp.task('watch', function(){
    watch([path.watch.js], function(ev, callback){
        gulp.start('js:build');
    });
    watch([path.watch.html], function(ev, callback){
        gulp.start('html:build');
    });
    watch([path.watch.style], function(ev, callback){
        gulp.start('style:build');
    });
    watch([path.watch.img], function(ev, callback){
        gulp.start('image');
    });

});


gulp.task('clean', function(callback){
    rimRaf(path.clean, callback)
});

gulp.task('default', ['build', 'webServer', 'watch']);