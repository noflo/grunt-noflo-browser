exports.register = function (loader, callback) {
  var components = <%= components %>
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
  return callback();
};

