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
      tests: ['tmp', 'test/fixtures/node_modules/'],
    },

    exec: {
      install_fixture_deps: {
        command: 'npm install',
        cwd: 'test/fixtures/'
      }
    },

    // Configuration to be run (and then tested).
    noflo_browser: {
      build: {
        options: {
          graph_scripts: ['foo.js'],
          graph: 'bar/Clock'
        },
        files: {
          'tmp/noflo.js': ['test/fixtures/component.json']
        }
      }
    },

    noflo_optimized: {
      build: {
        files: {
          'tmp2/noflo.js': ['test/fixtures/graphs/Clock.json']
        }
      }
    },

    // End-to-End smoketests
    mocha_phantomjs: {
      options: {
        output: 'spec/result.xml',
        reporter: 'spec',
        failWithOutput: true
      },
      all: ['spec/runner.html']
    }

  });

  // Actually load this plugin's task(s).
  grunt.loadTasks('tasks');

  // These plugins provide necessary tasks.
  grunt.loadNpmTasks('grunt-exec');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-mocha-phantomjs');

  // Whenever the "test" task is run, first clean the "tmp" dir, then run this
  // plugin's task(s), then test the result.
  grunt.registerTask('test', ['clean', 'exec:install_fixture_deps', 'noflo_browser', 'mocha_phantomjs']);

  // By default, lint and run all tests.
  grunt.registerTask('default', ['jshint', 'test']);

};
