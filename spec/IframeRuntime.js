describe('IFRAME runtime', function () {
  var iframe = null;
  var origin = null;
  var listener = null;
  send = function(protocol, command, payload) {
    var msg = {
      protocol: protocol,
      command: command,
      payload: payload
    };
    var serialized = JSON.stringify(msg);
    return iframe.postMessage(serialized, '*');
  };
  before(function (done) {
    this.timeout(10000);
    var fixtureContainer = document.createElement('div');
    document.body.appendChild(fixtureContainer);
    if (!fixtureContainer) {
      return done(new Error('Fixture container not found'));
    }
    var iframeElement = document.createElement('iframe');
    iframeElement.sandbox = 'allow-scripts';
    iframeElement.src = '/base/dist/Clock.html?fbp_noload=true&fbp_protocol=iframe';
    iframeElement.onload = function () {
      iframe = iframeElement.contentWindow;
      setTimeout(function () {
        done();
      }, 100);
    };
    origin = window.location.origin;
    fixtureContainer.appendChild(iframeElement);
  });
  describe('Runtime Protocol', function() {
    describe('requesting runtime metadata', function() {
      it('should provide it back', function(done) {
        this.timeout(4000);
        listener = function(message) {
          window.removeEventListener('message', listener, false);
          listener = null;
          msg = JSON.parse(message.data);
          chai.expect(msg.protocol).to.equal('runtime');
          chai.expect(msg.command).to.equal('runtime');
          chai.expect(msg.payload).to.be.an('object');
          chai.expect(msg.payload.type).to.equal('noflo-browser');
          chai.expect(msg.payload.capabilities).to.be.an('array');
          done();
        };
        window.addEventListener('message', listener, false);
        return send('runtime', 'getruntime', '');
      });
    });
  });
  describe('Component Protocol', function() {
    describe('requesting component listing', function() {
      it('should provide it back', function(done) {
        this.timeout(4000);
        var received = 0;
        if (listener) {
          return done(new Error('Previous test still listening, abort'));
        }
        listener = function(message) {
          var msg = JSON.parse(message.data);
          if (msg.protocol !== 'component') {
            return;
          }
          if (msg.command === 'component') {
            chai.expect(msg.payload).to.be.an('object');
            received++;
          }
          if (msg.command === 'componentsready') {
            chai.expect(msg.payload).to.equal(received);
            chai.expect(received).to.be.above(5);
            window.removeEventListener('message', listener, false);
            listener = null;
            done();
          }
          return;
        };
        window.addEventListener('message', listener, false);
        send('component', 'list', 'bar');
      });
    });
  });
});
