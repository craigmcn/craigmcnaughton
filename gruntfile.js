module.exports = function(grunt) {

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),

        sass: {
            expanded: {
                options: {
                     style: 'expanded'
                },
                files: {
                     'css/styles.css': 'css/main.scss'
                }
            },
            compressed: {
                options: {
                     style: 'compressed'
                },
                files: {
                     'css/styles.min.css': 'css/main.scss'
                }
            }
        },
        uglify: {
            my_target: {
                files: {
                    'js/scripts.min.js': ['js/script.js']
                }
            }
        },
        watch: {
            css: {
                files: ['css/**/*.scss'],
                tasks: ['sass:expanded', 'sass:compressed'],
                options: {
                    spawn: false,
                }
            },
            scripts: {
                files: ['js/*.js'],
                tasks: ['uglify'],
                options: {
                    spawn: false,
                }
            },
            configFiles: {
                files: ['gruntfile.js'],
                options: {
                    reload: true
                }
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-sass');

    grunt.registerTask('default', ['sass:expanded', 'sass:compressed', 'watch', 'uglify']);

};