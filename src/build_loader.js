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

var serialize = function(modules, options) {
  var lines = [];
  var indent = '    ';
  modules.forEach(function (module) {
    if (!module.components) {
      return;
    }
    module.components.forEach(function (component) {
      var fullname = module.name ? module.name + "/" + component.name : component.name;
      var componentPath = path.resolve(options.baseDir, component.path);
      lines.push(indent + "'" + fullname + "': require('" + componentPath + "')");
    });
  });
  var contents = "{\n" + (lines.join(',\n')) + "\n  };";
  return contents;
};

module.exports = function (options, callback) {
  var manifestOptions = options.manifest;
  return fbpManifest.load.load(options.baseDir, manifestOptions, function(err, manifest) {
    if (err) {
      return callback(err);
    }
    return filterDependencies(manifest.modules, options, function(err, modules) {
      var contents = serialize(modules, options);
      return callback(err, contents);
    });
  });
};
