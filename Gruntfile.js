/*
 * grunt-noflo-browser
 * https://github.com/noflo/grunt-noflo-browser
 *
 * Copyright (c) 2014 Henri Bergius
 * Licensed under the MIT license.
 */

'use strict';

module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    jshint: {
      all: [
        'Gruntfile.js',
        'tasks/*.js',
        'src/*.js'
      ],
      options: {
        jshintrc: '.jshintrc',
      }
    },

    // Before generating any new files, remove any previously-created files.
    clean: {
      tests: ['dist', 'example/node_modules/'],
    },

    exec: {
      install_fixture_deps: {
        command: 'npm install',
        cwd: 'example'
      }
    },

    // Configuration to be run (and then tested).
    noflo_browser: {
      build: {
        options: {
          graph: 'bar/Clock',
          debug: true
        },
        files: {
          'dist/noflo.js': ['example/package.json']
        }
      }
    },
    // Configuration for the test runner in fixtures
    noflo_browser_mocha: {
      all: {
        options: {
          scripts: ["../dist/noflo.js"]
        },
        files: {
          'spec/runner.html': ['spec/*.js']
        }
      }
    },

    // End-to-End smoketests
    karma: {
      unit: {
        configFile: 'node_modules/noflo-webpack-config/karma.config.js',
      },
    },
  });

  // Actually load this plugin's task(s).
  grunt.loadTasks('tasks');

  // These plugins provide necessary tasks.
  grunt.loadNpmTasks('grunt-exec');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-karma');

  // Whenever the "test" task is run, first clean the "dist" dir, then run this
  // plugin's task(s), then test the result.
  grunt.registerTask('test', ['clean', 'exec:install_fixture_deps', 'noflo_browser', 'noflo_browser_mocha', 'karma']);

  // By default, lint and run all tests.
  grunt.registerTask('default', ['jshint', 'test']);

};
