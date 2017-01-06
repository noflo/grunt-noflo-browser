var fbpManifest = require('fbp-manifest');
var path = require('path');
var bluebird = require('bluebird');

var filterDependencies = function(modules, options, callback) {
  var applicableModules = modules.filter(function (m) {
    var modulePath = path.resolve(options.baseDir, m.base);
    if (modulePath !== options.baseDir) { return false; }
    if (m.runtime !== 'noflo-browser' && m.runtime !== 'noflo') { return false; }
    return true;
  });
  applicableModules.forEach(function (m) {
    m.components = m.components.filter(function (c) {
      if (c.elementary) {
        return false;
      }
      if (path.extname(c.path) !== '.json') {
        return false;
      }
      var moduleName = m.name + '/' + c.name;
      if (options.graph && moduleName !== options.graph) {
        return false;
      }
      return true;
    });
  });
  applicableModules = applicableModules.filter(function (m) {
    if (!m.components || !m.components.length) { return false; }
    return true;
  });
  callback(null, applicableModules);
};

var serialize = function (module, options, grunt, callback) {
  var modulePath = path.resolve(options.baseDir, module.base);
  var templateName = (options.debug) ? 'graphDebug' : 'graph';
  var graphFileTemplatePath = path.resolve(__dirname, '../templates/' + templateName + '.html');
  var graphFileTemplate = grunt.file.read(graphFileTemplatePath);
  module.components.forEach(function (graphComponent) {
    var graphPath = path.resolve(modulePath, graphComponent.path);
    var graph = grunt.file.readJSON(graphPath);
    if (!graph.properties || !graph.properties.environment || !graph.properties.environment.content) {
      // No HTML demo definition
      return;
    }
    var templateData = {
      name: graphComponent.name,
      scripts: options.graph_scripts,
      lib: module.name,
      ideUrl: options.ide,
      signalServer: options.signalserver,
      noflo: options.destName + '.js',
      graphPath: module.name + '/' + graphComponent.name,
      content: graph.properties.environment.content,
      heads: options.heads
    };
    var templated = grunt.template.process(graphFileTemplate, {
      data: templateData
    });
    var demoFile = path.resolve(options.destDir, graphComponent.name + '.html');
    grunt.file.write(demoFile, templated);
    grunt.log.writeln('Demo file ' + demoFile + ' built');
  });
  callback(null);
};

var discover = function (options, callback) {
  var manifestOptions = options.manifest;
  fbpManifest.load.load(options.baseDir, manifestOptions, function(err, manifest) {
    if (err) {
      return callback(err);
    }
    filterDependencies(manifest.modules, options, callback);
  });
  return;
};

var buildDemos = function (grunt, graphs, options, callback) {
  graphs.forEach(function (graphFile) {
    if (path.extname(graphFile) !== '.json') {
      // Skip non-JSON graphs
      return;
    }

    var graphName = path.basename(graphFile, path.extname(graphFile));
    var graphPath = path.resolve(options.srcDir, graphFile);

    var graph = grunt.file.readJSON(graphPath);
    if (!graph.properties.environment || !graph.properties.environment.type || graph.properties.environment.type !== 'noflo-browser') {
      // Skip graphs for other runtimes
      return;
    }

    if (!graph.properties.environment.content) {
      // Skip graphs without demo content
      return;
    }

    var templated = grunt.template.process(options.graphFileTemplate, {
      data: {
        name: graphName,
        scripts: options.scripts,
        lib: options.lib,
        ideUrl: options.ide,
        signalServer: options.signalserver,
        noflo: options.destPath,
        graphPath: options.lib + '/' + graphFile,
        content: graph.properties.environment.content,
        heads: options.heads
      }
    });
    var demoFile = path.resolve(options.destDir, graphName + '.html');
    grunt.file.write(demoFile, templated);
    grunt.log.writeln('Demo file "' + demoFile + '" built');
  });
};

module.exports = function (options, grunt, callback) {
  discover(options, function (err, modules) {
    if (err) { return callback(err); }
    var ser = bluebird.promisify(serialize);
    bluebird.map(modules, function (m) {
      return ser(m, options, grunt);
    }).asCallback(callback);
  });
};
