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

exports.getSource = function (loader, name, callback) {
  if (!loader.components[name]) {
    return callback(new Error('Component ' + name + ' not available'));
  }
  var component = loader.components[name];
  var nameParts = name.split('/');
  var componentData = {
    name: nameParts[1],
    library: nameParts[0]
  };
  if (loader.isGraph(component)) {
    componentData.code = JSON.stringify(component, null, 2);
    componentData.language = 'json'
    return callback(null, componentData);
  } else if (typeof component === 'function') {
    componentData.code = component.toString();
    componentData.language = 'javascript';
    return callback(null, componentData);
  } else if (typeof component.getComponent === 'function') {
    componentData.code = component.getComponent.toString();
    componentData.language = 'javascript';
    return callback(null, componentData);
  }
  return callback(new Error('Unable to get sources for ' + name));
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

