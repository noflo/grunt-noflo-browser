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
    describe('getSource', function () {
      var repeatSource = null;
      it('should be able to read sources for elementary component', function (done) {
        var loader = new noflo.ComponentLoader('');
        loader.getSource('core/Repeat', function (err, c) {
          if (err) {
            return done(err);
          }
          chai.expect(c.library).to.equal('core');
          chai.expect(c.name).to.equal('Repeat');
          chai.expect(c.language).to.equal('coffeescript');
          chai.expect(c.code).to.include('Component');
          done();
        });
      });
      it('should be able to read sources for graph component', function (done) {
        var loader = new noflo.ComponentLoader('');
        loader.getSource('bar/Clock', function (err, c) {
          if (err) {
            return done(err);
          }
          chai.expect(c.library).to.equal('bar');
          chai.expect(c.name).to.equal('Clock');
          chai.expect(c.language).to.equal('json');
          chai.expect(c.code).not.to.be.empty;
          done();
        });
      });
    });
    describe('setSource', function () {
      var loader = null;
      var source = null;
      before(function () {
        loader = new noflo.ComponentLoader('');
        source = "var noflo = require('noflo');\n" +
         "exports.getComponent = function () {\n" +
         "  var c = new noflo.Component({\n" +
         "    inPorts: {\n" +
         "      'in': {\n" +
         "        datatype: 'integer'\n" +
         "      }\n" +
         "    },\n" +
         "     outPorts: {\n" +
         "       out: {\n" +
         "         datatype: 'integer'\n" +
         "       }\n" +
         "     }\n" +
         "  });\n" +
         "  return c.process(function (input, output) {\n" +
         "    output.sendDone(input.getData() + 1);\n" +
         "  });\n" +
         "}"
      });
      it('should be able to write sources for elementary component', function (done) {
        loader.setSource('bar', 'AddOne', source, 'javascript', function (err) {
          if (err) {
            return done(err);
          }
          done();
        });
      });
      it('should produce a runnable component', function (done) {
        loader.load('bar/AddOne', function (err, c) {
          if (err) {
            return done(err);
          }
          var ins = noflo.internalSocket.createSocket();
          var out = noflo.internalSocket.createSocket();
          c.inPorts.in.attach(ins);
          c.outPorts.out.attach(out);
          out.on('data', function (data) {
            chai.expect(data).to.equal(2);
            c.outPorts.out.detach(out);
            done();
          });
          ins.connect();
          ins.send(1);
          ins.disconnect();
        });
      });
      it('should be able to read sources for the registered component', function (done) {
        loader.getSource('bar/AddOne', function (err, c) {
          if (err) {
            return done(err);
          }
          chai.expect(c.library).to.equal('bar');
          chai.expect(c.name).to.equal('AddOne');
          chai.expect(c.language).to.equal('javascript');
          chai.expect(c.code).to.equal(source);
          done();
        });
      });
    });
  });
});
