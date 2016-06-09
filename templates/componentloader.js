var registerCustomLoaders = function (loader, loaders, callback) {
  if (!loaders.length) {
    return callback();
  }
  var customLoader = loaders.shift();
  loader.registerLoader(customLoader, function (err) {
    if (err) {
      return callback(err);
    }
    registerCustomLoaders(loader, loaders, callback);
  });
};

exports.register = function (loader, callback) {
  var components = <%= components %>
  var loaders = <%= loaders %>
  var names = Object.keys(components);

  names.forEach(function (fullname) {
    var mod = components[fullname];
    var tok = fullname.split('/');
    if (tok.length == 2) {
      var modulename = tok[0];
      var componentname = tok[1];
      loader.registerComponent(modulename, componentname, mod);
    } else {
      loader.registerComponent(null, fullname, mod);
    }
  });

  if (!loaders.length) {
    return callback();
  }

  registerCustomLoaders(loader, loaders, callback);
};

