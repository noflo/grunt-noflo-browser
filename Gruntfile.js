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
      tests: ['tmp', 'spec/fixtures/node_modules/'],
    },

    exec: {
      install_fixture_deps: {
        command: 'npm install',
        cwd: 'spec/fixtures/'
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
          'tmp/noflo.js': ['spec/fixtures/package.json']
        }
      }
    },
    // Configuration for the test runner in fixtures
    noflo_browser_mocha: {
      all: {
        options: {
          scripts: ["../tmp/noflo.js"]
        },
        files: {
          'spec/runner.html': ['spec/*.js']
        }
      }
    },

    // End-to-End smoketests
    connect: {
      server: {
        options: {
          port: 8000
        }
      }
    },
    mocha_phantomjs: {
      all: {
        options: {
          output: 'spec/result.xml',
          reporter: 'spec',
          urls: ['http://localhost:8000/spec/runner.html'],
          failWithOutput: true
        }
      }
    }

  });

  // Actually load this plugin's task(s).
  grunt.loadTasks('tasks');

  // These plugins provide necessary tasks.
  grunt.loadNpmTasks('grunt-exec');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-connect');
  grunt.loadNpmTasks('grunt-mocha-phantomjs');

  // Whenever the "test" task is run, first clean the "tmp" dir, then run this
  // plugin's task(s), then test the result.
  grunt.registerTask('test', ['clean', 'exec:install_fixture_deps', 'noflo_browser', 'noflo_browser_mocha', 'connect:server', 'mocha_phantomjs']);

  // By default, lint and run all tests.
  grunt.registerTask('default', ['jshint', 'test']);

};
