var noflo = require('noflo');
var path = require('path');
var browserify = require('browserify');

function generateGraphRunner (graph, loader) {
  var src = 'var processes = {},sockets=[],noflo=require(\'noflo\');\n';
  Object.keys(graph.processes).forEach(function (process) {
    src += 'processes.' + process + ' = require(\'' + loader.components[graph.processes[process].component] + '\').getComponent();\n';
  });

  graph.connections.forEach(function (edge, idx) {
    if (!edge.src) {
      return;
    }
    src += 'sockets[' + idx + '] = noflo.internalSocket.createSocket();';
    src += 'processes.' + edge.src.process + '.outPorts[\'' + edge.src.port + '\'].attach(sockets[' + idx + ']);\n';
    src += 'processes.' + edge.tgt.process + '.inPorts[\'' + edge.tgt.port + '\'].attach(sockets[' + idx + ']);\n';
  });

  graph.connections.forEach(function (edge, idx) {
    if (edge.src) {
      return;
    }
    src += 'sockets[' + idx + '] = noflo.internalSocket.createSocket();\n';
    src += 'processes.' + edge.tgt.process + '.inPorts[\'' + edge.tgt.port + '\'].attach(sockets[' + idx + ']);\n';
    src += 'sockets[' + idx + '].send(' + JSON.stringify(edge.data) + ');\n';
    src += 'sockets[' + idx + '].disconnect();\n';
  });

  return src;
}

module.exports = function (grunt) {
  grunt.registerMultiTask('noflo_optimized', 'Grunt plugin for creating optimized NoFlo builds for running a graph', function () {
    var options = this.options({
      platform: 'noflo-browser',
      excludes: [
        'emitter',
        'btoa',
        'atob',
        'fs',
        'read-installed',
        'path',
        'coffee-script',
        'buffer',
      ],
      ignores: [
        'node_modules/noflo/lib/nodejs/ComponentLoader.js',
        'node_modules/noflo/lib/Network.js',
        'node_modules/noflo/lib/Graph.js',
        'node_modules/noflo/lib/Journal.js',
        'node_modules/noflo/lib/ComponentLoader.js'
      ],
      baseDir: process.cwd()
    });

    var done = this.async();
    var graphFileTemplate = grunt.file.read(path.resolve(__dirname, '../templates/graphOptimized.html'));
    var b = new browserify({
      extensions: ['.coffee']
    });
    b.transform('coffeeify');
    options.excludes.forEach(function (excludeModule) {
      b.exclude(excludeModule);
    });
    options.ignores.forEach(function (ignoreModule) {
      b.ignore(ignoreModule);
    });

    this.files.forEach(function (f) {
      var src = f.src.filter(function(filepath) {
        // Warn on and remove invalid source files (if nonull was set).
        if (!grunt.file.exists(filepath)) {
          grunt.log.warn('Source file "' + filepath + '" not found.');
          return false;
        } else {
          return true;
        }
      }).forEach(function (graphPath) {
        var components = [];
        var graph = grunt.file.readJSON(graphPath);
        Object.keys(graph.processes).forEach(function (nodeName) {
          var component = graph.processes[nodeName].component;
          if (components.indexOf(component) === -1) {
            components.push(component);
          }
        });

        var loader = new noflo.ComponentLoader(options.baseDir);
        loader.listComponents(function () {
          components.forEach(function (component) {
            if (!loader.components[component]) {
              console.log('Missing', component);
              // TODO: Error
              return;
            }
            b.add(loader.components[component]);
          });

          var graphJs = path.resolve(path.dirname(graphPath), path.basename(graphPath, path.extname(graphPath)) + '.js');
          grunt.file.write(graphJs, generateGraphRunner(graph, loader));
          b.require(graphJs, {
            expose: 'main'
          });

          var d = b.deps();
          var seen = [];
          d.on('data', function (data) {
            if (seen.indexOf(data.id) !== -1) {
              return;
            }
            grunt.log.writeln('Add ' + data.id);
            seen.push(data.id);
          });

          b.bundle({
            debug: false,
            insertGlobals: false,
            detectGlobals: true
          }, function (err, src) {
            if (err) {
              grunt.fail.warn(err);
              return;
            }

            grunt.file.write(f.dest, src);
            grunt.log.writeln('File ' + f.dest + ' built.');

            if (!graph.properties.environment.content) {
              return done();
            }
            var graphName = path.basename(graphPath, path.extname(graphPath));
            var templated = grunt.template.process(graphFileTemplate, {
              data: {
                name: graphName,
                noflo: path.basename(f.dest),
                content: graph.properties.environment.content
              }
            });
            var demoFile = path.resolve(path.dirname(f.dest), graphName + '.html');
            grunt.file.write(demoFile, templated);
            grunt.log.writeln('Demo file "' + demoFile + '" built');

            done();
          });
        });
      });
    });
  });
};
