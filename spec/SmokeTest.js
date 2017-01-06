describe('A browser-built module', function () {
  var noflo;
  it('should expose a require', function () {
    chai.expect(require).to.be.a('function');
  });
  it('should be able to load NoFlo', function () {
    noflo = require('noflo');
    chai.expect(noflo.ComponentLoader).to.be.a('function');
  });
  it('should know this is browser', function () {
    chai.expect(noflo.isBrowser()).to.equal(true);
  });
  describe('The built NoFlo', function () {
    var instance;
    it('should be able to load a component', function (done) {
      var loader = new noflo.ComponentLoader('');
      loader.load('core/Repeat', function (err, c) {
        if (err) {
          return done(err);
        }
        instance = c;
        chai.expect(instance).to.be.an('object');
        done();
      });
    });
    it('should basically work', function (done) {
      var ins = noflo.internalSocket.createSocket();
      var out = noflo.internalSocket.createSocket();
      instance.inPorts.in.attach(ins);
      instance.outPorts.out.attach(out);
      out.on('data', function (data) {
        chai.expect(data).to.equal('Hello NoFlo');
        instance.outPorts.out.detach(out);
        done();
      });
      ins.connect();
      ins.send('Hello NoFlo');
      ins.disconnect();
    });
    it('should be able to read sources for elementary component', function (done) {
      var loader = new noflo.ComponentLoader('');
      loader.getSource('core/Repeat', function (err, c) {
        if (err) {
          return done(err);
        }
        chai.expect(c.library).to.equal('core');
        chai.expect(c.name).to.equal('Repeat');
        chai.expect(c.language).to.equal('javascript');
        chai.expect(c.code).to.contain('noflo.Component');
        done();
      });
    });
    it('should be able to read sources for graph component', function (done) {
      var loader = new noflo.ComponentLoader('');
      loader.getSource('bar/Clock', function (err, c) {
        if (err) {
          return done(err);
        }
        chai.expect(c.library).to.equal('core');
        chai.expect(c.name).to.equal('Repeat');
        chai.expect(c.language).to.equal('javascript');
        chai.expect(c.code).to.contain('noflo.Component');
        done();
      });
    });
  });
});
