/*
 * grunt-noflo-browser
 * https://github.com/noflo/grunt-noflo-browser
 *
 * Copyright (c) 2014 Henri Bergius
 * Licensed under the MIT license.
 */

'use strict';

var path = require('path');
var webpack = require('webpack');
var createDemos = require('../src/create_demos');
var buildLoader = require('../src/build_loader');

module.exports = function(grunt) {
  grunt.registerMultiTask('noflo_browser', 'Grunt plugin for building NoFlo projects for the browser', function() {
    var options = this.options({
      development: false,
      debug: false,
      ide: 'https://app.flowhub.io',
      signalserver: 'https://api.flowhub.io',
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
        target: 'web',
        externals: {
        },
        plugins: []
      },
      // Default options for fbp-manifest
      manifest: {
        runtimes: ['noflo'],
        discover: true,
        recursive: true
      },
      runtimes: ['noflo', 'noflo-browser'],
      graph_scripts: [],
      heads: [],
    });

    // Force task to async mode
    var done = this.async();
    var todo = 0;

    var templateName = (options.debug) ? "graphDebug" : "graph";
    var graphFileTemplate = grunt.file.read(path.resolve(__dirname, '../templates/'+templateName+'.html'));
    var componentLoaderTemplate = grunt.file.read(path.resolve(__dirname, '../templates/componentloader.js'));

    // Iterate over all specified file groups.
    var handled = [];
    this.files.forEach(function(f) {
      var src = f.src.map(function (filepath) {
        // Turn possible legacy-style filenames to baseDirs
        if (grunt.file.isFile(filepath)) {
          filepath = path.dirname(filepath);
        }
        return path.resolve(process.cwd(), filepath);
      }).filter(function(filepath) {
        // Check that the directory exists
        if (!grunt.file.isDir(filepath)) {
          grunt.log.warn('Base directory "' + filepath + '" not found.');
          return false;
        }
        return true;
      });
      
      src.forEach(function (baseDir) {
        todo++;
        options.baseDir = baseDir;
        buildLoader(options, function (err, components) {
          if (err) {
            todo--;
            grunt.fail.warn(err);
            return;
          }
          var customLoader = grunt.template.process(componentLoaderTemplate, {
            data: {
              components: components
            }
          });

          var loaderPath = path.resolve(baseDir, path.basename(f.dest, path.extname(f.dest)) + '.loader.js');
          var entryPath = path.resolve(baseDir, path.basename(f.dest, path.extname(f.dest)) + '.entry.js');
          grunt.file.write(loaderPath, customLoader);
          grunt.file.copy(path.resolve(__dirname, '../templates/entry.js'), entryPath);

          var webpackConfig = options.webpack;
          webpackConfig.plugins.push(new webpack.NormalModuleReplacementPlugin(/\.\/loader\/register/, require.resolve(loaderPath)));
          webpackConfig.output = {
            path: path.dirname(f.dest),
            filename: path.basename(f.dest)
          };
          webpackConfig.context = baseDir;
          /*
          webpackConfig.resolve = {
            root: [
              path.resolve(process.cwd(), path.dirname(f.dest)),
              baseDir,
              path.resolve(baseDir, 'node_modules/')
            ],
            extensions: ["", ".coffee", ".js"]
          };*/
          webpackConfig.entry = entryPath;
          if (webpackConfig.target !== 'node') {
            webpackConfig.node = {
              fs: 'empty'
            };
          }
          console.log(webpackConfig);

          webpack(webpackConfig).run(function (err, stats) {
            grunt.file.delete(entryPath);
            grunt.file.delete(loaderPath);
            if (err) {
              todo--;
              grunt.fail.warn(err);
              return;
            }
            var statsJson = stats.toJson();
            if (stats.hasErrors()) {
              todo--;
              statsJson.errors.forEach(function (e) {
                grunt.log.writeln(e);
              });
              grunt.fail.warn(statsJson.errors.length + ' errors building ' + baseDir);
              return;
            }
            if (stats.hasWarnings()) {
              console.log('WARN');
              statsJson.warnings.forEach(function (w) {
                grunt.log.writeln(w);
              });
            }
            console.log(stats.toString({
              colors: true
            }));
            todo--;
            if (todo === 0) {
              done();
            }
          });

        });
        /*
             TODO: createDemos
            if (!manifest.noflo || !manifest.noflo.graphs) {
              return;
            }
            Object.keys(manifest.noflo.graphs).forEach(function (graphName) {
            writeGraphFiles(grunt.file.readJSON(manifestPath), options.graph_scripts, manifestDir, path.resolve(process.cwd(), path.dirname(f.dest)), path.basename(f.dest));
            */
      });
    });
  });
};
