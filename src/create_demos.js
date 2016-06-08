var path = require('path');

module.exports = function (grunt, graphs, options, callback) {
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
