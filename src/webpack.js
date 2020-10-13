var webpack = require('webpack');
var clone = require('clone');
var path = require('path');

exports.isDirectEntry = function (src, grunt, options) {
  if (grunt.file.isFile(src)) {
    var ext = path.extname(src);
    if (options.directEntries.indexOf(ext) !== -1) {
      // This is a proper entry file, use as-is
      return true;
    }
  }
  return false;

};

exports.configure = function (options) {
  var config = clone(options.webpack);

  // Prepare our plugins
  if (!config.plugins) {
    config.plugins = [];
  }

  // Configurable ignores
  options.ignores.forEach(function (ignore) {
    config.plugins.push(new webpack.IgnorePlugin(ignore));
  });

  // Inject noflo-component-loader
  config.module.rules[0] = {
    test: /noflo([\\]+|\/)lib([\\]+|\/)loader([\\]+|\/)register.js$/,
    use: [
      {
        loader: 'noflo-component-loader',
        options: {
          graph: options.graph,
          debug: options.debug,
          baseDir: options.baseDir,
          manifest: options.manifest,
          runtimes: options.runtimes,
        }
      }
    ]
  };

  config.output = {
    path: options.destDir,
    filename: options.destName + '.js'
  };

  config.context = options.baseDir;
  config.entry = path.relative(options.baseDir, config.entry);
  config.entry = path.resolve(options.baseDir, config.entry);

  return config;
};

exports.run = function (config, callback) {
  webpack(config).run(function (err, stats) {
    if (err) {
      return callback(err);
    }
    var statsJson = stats.toJson();
    if (stats.hasErrors()) {
      console.log(stats.toString({
        colors: true
      }));
      return callback(new Error(statsJson.errors.length + ' errors building ' + config.entry));
    }
    console.log(stats.toString({
      colors: true
    }));
    callback();
  });
};
