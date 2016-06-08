/*
 * grunt-noflo-browser
 * https://github.com/noflo/grunt-noflo-browser
 *
 * Copyright (c) 2014 Henri Bergius
 * Licensed under the MIT license.
 */

'use strict';

var path = require('path');
var webpack = require('../src/webpack');
var createDemos = require('../src/create_demos');
var buildLoader = require('../src/build_loader');
var bluebird = require('bluebird');
var clone = require('clone');

module.exports = function(grunt) {
  grunt.registerMultiTask('noflo_browser', 'Grunt plugin for building NoFlo projects for the browser', function() {
    var options = this.options({
      // Provide a graph component name to scope the build only to include its dependencies
      graph: null,
      // Default options for WebPack
      webpack: {
        module: {
          loaders: [
            { test: /\.coffee$/, loader: "coffee-loader" },
            { test: /\.json$/, loader: "json-loader" },
            { test: /\.fbp$/, loader: "fbp-loader" }
          ],
        },
        resolve: {
          extensions: ["", ".coffee", ".js"],
        },
        entry: null,
        target: 'web',
        externals: {},
        plugins: []
      },
      // Modules that should be completely ignored
      ignores: [
        /tv4/
      ],
      // Files that can be used as entry files
      directEntries: ['.js', '.coffee'],
      // Default options for fbp-manifest
      manifest: {
        runtimes: ['noflo'],
        discover: true,
        recursive: true
      },
      // Options for demo files
      graph_scripts: [],
      heads: [],
      development: false,
      debug: false,
      ide: 'https://app.flowhub.io',
      signalserver: 'https://api.flowhub.io'
    });

    // Force task to async mode
    var done = this.async();

    // Iterate over all specified file groups.
    bluebird.map(this.files, function (f) {
      var fileOptions = clone(options);
      fileOptions.destName = path.basename(f.dest, path.extname(f.dest));
      fileOptions.destDir = path.resolve(process.cwd(), path.dirname(f.dest));

      return bluebird.map(f.src, function (filepath) {
        return new bluebird.Promise(function (resolve) {
          if (grunt.file.isDir(filepath)) {
            fileOptions.baseDir = path.resolve(process.cwd(), filepath);
          } else {
            fileOptions.baseDir = path.resolve(process.cwd(), path.dirname(filepath));
          }

          // Check if the file can be used as an entry as-is
          if (webpack.isDirectEntry(filepath, grunt, fileOptions)) {
            fileOptions.directEntry = true;
            return resolve(filepath);
          }

          // No usable entry file found, create from template
          var entryPath = path.resolve(fileOptions.baseDir, fileOptions.destName + '.entry.js');
          grunt.file.copy(path.resolve(__dirname, '../templates/entry.js'), entryPath);
          return resolve(entryPath);
        }).then(function (entryPath) {
          fileOptions.webpack.entry = entryPath;

          fileOptions.runtimes = fileOptions.manifest.runtimes.slice(0);
          if (fileOptions.webpack.target === 'node') {
            fileOptions.runtimes.push('noflo-nodejs');
          } else {
            fileOptions.runtimes.push('noflo-browser');
          }

          var discover = bluebird.promisify(buildLoader.discover);
          return discover(fileOptions);
        }).then(function (components) {
          fileOptions.loaderPath = buildLoader.save(components, grunt, fileOptions);

          var config = webpack.configure(fileOptions);
          return bluebird.promisify(webpack.run)(config)
        }).then(function () {
          grunt.file.delete(fileOptions.loaderPath);
          if (!fileOptions.isDirectEntry) {
            grunt.file.delete(fileOptions.webpack.entry);
          }
          return bluebird.resolve(null);
        });
      });
    })
    .nodeify(function (err, res) {
      if (err) {
        grunt.fail.warn(err);
        return;
      }
      done();
    });
    return;
    /*
             TODO: createDemos
            var templateName = (options.debug) ? "graphDebug" : "graph";
            var graphFileTemplate = grunt.file.read(path.resolve(__dirname, '../templates/'+templateName+'.html'));
            if (!manifest.noflo || !manifest.noflo.graphs) {
              return;
            }
            Object.keys(manifest.noflo.graphs).forEach(function (graphName) {
            writeGraphFiles(grunt.file.readJSON(manifestPath), options.graph_scripts, manifestDir, path.resolve(process.cwd(), path.dirname(f.dest)), path.basename(f.dest));
      });
    });
            */
  });
};
