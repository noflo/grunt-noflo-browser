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

  // Custom component loader for this build
  config.plugins.push(
    new webpack.NormalModuleReplacementPlugin(
      /\.\/loader\/register/,
      require.resolve(options.loaderPath)
    )
  );

  // Configurable ignores
  options.ignores.forEach(function (ignore) {
    config.plugins.push(new webpack.IgnorePlugin(ignore));
  });

  config.output = {
    path: options.destDir,
    filename: options.destName + '.js'
  };

  config.context = options.baseDir;

  if (config.target !== 'node') {
    config.node = {
      fs: 'empty'
    };
  }

  return config;
};

exports.run = function (config, callback) {
  webpack(config).run(function (err, stats) {
    if (err) {
      return callback(err);
    }
    var statsJson = stats.toJson();
    if (stats.hasErrors()) {
      statsJson.errors.forEach(function (e) {
        console.log(e);
      });
      return callback(new Error(statsJson.errors.length + ' errors building ' + config.entry));
    }
    if (stats.hasWarnings()) {
      statsJson.warnings.forEach(function (w) {
        console.log(w);
      });
    }
    console.log(stats.toString({
      colors: true
    }));
    callback();
  });
};
