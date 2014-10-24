/*
 * grunt-noflo-browser
 * https://github.com/noflo/grunt-noflo-browser
 *
 * Copyright (c) 2014 Henri Bergius, Jon Nordby
 * Licensed under the MIT license.
 */

'use strict';

var path = require('path');

var generateRunner = function(grunt, destination, testfiles, options, callback) {
    var templateName = "specRunner";
    var runnerFileTemplate = grunt.file.read(path.resolve(__dirname, '../templates/'+templateName+'.html'));

    var destDir = path.dirname(destination);
    var files = [];
    testfiles.forEach(function(f) {
        // URLs should be relative to dir of opened page
        var relative = path.relative(destDir, f);
        console.log(f, relative);
        files.push(relative);
    });
    console.log(files);
    var templated = grunt.template.process(runnerFileTemplate, {
      data: {
        title: options.title,
        scripts: options.scripts,
        testfiles: files
      }
    });
    var runnerFile = path.resolve(destination);
    grunt.file.write(runnerFile, templated);
    grunt.log.writeln('Wrote ' + destination);
    callback();
};

module.exports = function(grunt) {

  grunt.registerMultiTask('noflo_browser_mocha',
  'Grunt plugin for building Mocha test runner for NoFlo browser projects',
  function() {
    var options = this.options({
      title: 'Tests',
      scripts: []
    });

    // Force task to async mode
    var done = this.async();
    this.files.forEach(function(fileInfo) {
        generateRunner(grunt, fileInfo.dest, fileInfo.src, options, done);
    });
  });
};
