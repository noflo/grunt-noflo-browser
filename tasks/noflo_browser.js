/*
 * grunt-noflo-browser
 * https://github.com/noflo/grunt-noflo-browser
 *
 * Copyright (c) 2014 Henri Bergius
 * Licensed under the MIT license.
 */

'use strict';

var Installer = require('component-installer');
var Builder = require('component-builder');
var path = require('path');

module.exports = function(grunt) {

  grunt.registerMultiTask('noflo_browser', 'Grunt plugin for building NoFlo projects for the browser', function() {
    var options = this.options({
      require: true,
      development: false,
      debug: false,
      ide: 'http://app.flowhub.io',
      concurrency: 10,
      plugins: [
        'component-json',
        'component-coffee',
        'component-fbp'
      ],
      remotes: [],
      graph_scripts: []
    });

    // Force task to async mode
    var done = this.async();
    var todo = 0;

    var templateName = (options.debug) ? "graphDebug" : "graph";
    var graphFileTemplate = grunt.file.read(path.resolve(__dirname, '../templates/'+templateName+'.html'));
    var writeGraphFiles = function (manifest, scripts, srcDir, destDir, destPath) {
      if (!manifest.noflo || !manifest.noflo.graphs) {
        return;
      }
      Object.keys(manifest.noflo.graphs).forEach(function (graphName) {
        if (path.extname(manifest.noflo.graphs[graphName]) !== '.json') {
          return;
        }
        var graph = grunt.file.readJSON(path.resolve(srcDir, manifest.noflo.graphs[graphName]));
        if (!graph.properties.environment || !graph.properties.environment.type || graph.properties.environment.type !== 'noflo-browser') {
          return;
        }

        if (!graph.properties.environment.content) {
          return;
        }
        var templated = grunt.template.process(graphFileTemplate, {
          data: {
            name: graphName,
            scripts: scripts,
            lib: manifest.name,
            ideUrl: options.ide,
            noflo: destPath,
            graphPath: manifest.name + '/' + manifest.noflo.graphs[graphName],
            content: graph.properties.environment.content
          }
        });
        var demoFile = path.resolve(destDir, graphName + '.html');
        grunt.file.write(demoFile, templated);
        grunt.log.writeln('Demo file "' + demoFile + '" built');
      });
    };

    // Iterate over all specified file groups.
    this.files.forEach(function(f) {
      var src = f.src.filter(function(filepath) {
        // Warn on and remove invalid source files (if nonull was set).
        if (!grunt.file.exists(filepath)) {
          grunt.log.warn('Source file "' + filepath + '" not found.');
          return false;
        } else {
          return true;
        }
      }).forEach(function (manifestPath) {
        todo++;
        var manifestDir =  path.resolve(process.cwd(), path.dirname(manifestPath));

        var installer = new Installer(manifestDir);
        installer.concurrency(options.concurrency);
        installer.destination(path.resolve(manifestDir, 'components/'));

        options.remotes.forEach(function (remote) {
          installer.remote(remote);
        });

        if (options.development) {
          installer.development();
        }

        installer.on('package', function (pkg) {
          if (pkg.inFlight) {
            return;
          }
          grunt.log.writeln('install ' + pkg.slug);

          pkg.on('error', function (err){
            if (err.fatal) {
              grunt.fail.warn(err);
              return;
            }
            grunt.log.error(err);
          });

          pkg.on('exists', function (dep){
            grunt.verbose.writeln('exists ' + dep.slug);
          });

          pkg.on('end', function() {
            grunt.log.writeln(pkg.name + ' complete');
          });
        });

        installer.install(function (err) {
          if (err) {
            grunt.fail.warn(err);
            return;
          }

          var builder = new Builder(manifestDir); 
          builder.copyAssetsTo(path.resolve(process.cwd(), path.dirname(f.dest)));

          // Load plugins
          options.plugins.forEach(function (plugin) {
            builder.use(require(plugin));
          });

          if (options.development) {
            builder.development();
            builder.addSourceURLs();
          }

          builder.build(function (err, obj) {
            if (err) {
              grunt.fail.warn(err);
              return;
            }

            var js = '';

            if (options.require) {
              js += obj.require;
            }

            js += obj.js;

            // Cleanup
            js = js.replace(/\.coffee(\'|\")/g, '.js$1');

            // Write the destination file.
            grunt.file.write(f.dest, js);

            // Print a success message.
            grunt.log.writeln('File "' + f.dest + '" built.');

            writeGraphFiles(grunt.file.readJSON(manifestPath), options.graph_scripts, manifestDir, path.resolve(process.cwd(), path.dirname(f.dest)), path.basename(f.dest));

            todo--;
            if (todo === 0) {
              done();
            }
          });
        });
      });
    });
  });
};
