'use strict';

var grunt = require('grunt');

function readFile(file) {
  var contents = grunt.file.read(file);
  if (process.platform === 'win32') {
    contents = contents.replace(/\r\n/g, '\n');
  }
  return contents;
}

function assertFileEquality(test, pathToActual, pathToExpected, message) {
  var actual, expected;
  expected = readFile(pathToExpected);
  try {
    actual = readFile(pathToActual);
  } catch (e) {
    console.log("\n" + e.message);
  }
  test.equal(expected, actual, message);
}

exports.noflo_browser = {
  update: function(test) {
    test.expect(2);

    assertFileEquality(test,
      'tmp/noflo.js',
      'test/expected/noflo.js',
      'Should generate the expected NoFlo JavaScript file'
    );
    assertFileEquality(test,
      'tmp/Clock.html',
      'test/expected/Clock.html',
      'Should extract the HTML from the graph into a file'
    );

    test.done();
  }
};
