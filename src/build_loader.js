var fbpManifest = require('fbp-manifest');
var path = require('path');

var filterDependencies = function(modules, options, callback) {
  if (options.graph) {
    return fbpManifest.dependencies.find(modules, options.graph, options, function(err, filtered) {
      if (err) {
        return callback(err);
      }
      var nofloMainModule = modules.filter(function(m) {
        return m.name === '';
      });
      return callback(null, filtered.concat(nofloMainModule));
    });
  } else {
    modules = modules.filter(function(m) {
      if (options.runtimes.indexOf(m.runtime) === -1) {
        return false;
      }
      return true;
    });
    return callback(null, modules);
  }
};

var serialize = function(modules, options, callback) {
  var loaders = [];
  var components = [];
  var indent = '    ';
  modules.forEach(function (module) {
    if (module.noflo && module.noflo.loader) {
      var loaderPath = path.resolve(options.baseDir, module.base, module.noflo.loader);
      loaders.push(indent + "require(" + JSON.stringify(loaderPath) + ")");
    }
    if (!module.components) {
      return;
    }
    module.components.forEach(function (component) {
      var moduleName = module.name ? '"' + module.name + '"' : 'null';
      var componentPath = path.resolve(options.baseDir, component.path);
      components.push("  loader.registerComponent(" + moduleName + ', "' + component.name + '", require(' + JSON.stringify(componentPath) + '))');
    });
  });
  var contents = {
    components: components.join(',\n'),
    loaders: "[\n" + (loaders.join(',\n')) + "\n  ];"
  };
  callback(null, contents);
};

exports.discover = function (options, callback) {
  var manifestOptions = options.manifest;
  fbpManifest.load.load(options.baseDir, manifestOptions, function(err, manifest) {
    if (err) {
      return callback(err);
    }
    filterDependencies(manifest.modules, options, function(err, modules) {
      if (err) {
        return callback(err);
      }
      serialize(modules, options, callback);
    });
  });
  return;
};

exports.save = function (requires, grunt, options) {
  var template = grunt.file.read(path.resolve(__dirname, '../templates/componentloader.js'));
  var customLoader = grunt.template.process(template, {
    data: requires
  });

  var loaderPath = path.resolve(options.baseDir, options.destName + '.loader.js');
  grunt.file.write(loaderPath, customLoader);
  return loaderPath;
};
