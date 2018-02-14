module.exports = function (grunt) {
  'use strict';

  require('load-grunt-tasks')(grunt);
  require('time-grunt')(grunt);

  var config = {
    watch: {
      js: {
        files: ['src/{,**/}*.js', 'test/{,**/}*.js'],
        tasks: ['eslint']
      }
    },
    eslint: {
      src: {
        options: {
          envs: ["node", "es6"]
        },
        files: {
          src: ['src/{,**/}*.js']
        }
      },
      test: {
        options: {
          envs: ["node", "es6", "mocha"]
        },
        files: {
          src: ['test/{,**/}*.js']
        }
      }
    },
  };

  grunt.initConfig(config);

  grunt.registerTask('default', [
    "watch"
  ]);

};
