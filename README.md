# grunt-noflo-browser [![Build Status](https://travis-ci.org/noflo/grunt-noflo-browser.svg?branch=master)](https://travis-ci.org/noflo/grunt-noflo-browser) [![Build status](https://ci.appveyor.com/api/projects/status/ft5ybv2laqu5aeio)](https://ci.appveyor.com/project/bergie/grunt-noflo-browser)

> Grunt plugin for building NoFlo projects for the browser. It also extracts possible HTML contents from graphs and creates demo files for them.

## Getting Started
This plugin requires Grunt `~0.4.1`

If you haven't used [Grunt](http://gruntjs.com/) before, be sure to check out the [Getting Started](http://gruntjs.com/getting-started) guide, as it explains how to create a [Gruntfile](http://gruntjs.com/sample-gruntfile) as well as install and use Grunt plugins. Once you're familiar with that process, you may install this plugin with this command:

```shell
npm install grunt-noflo-browser --save-dev
```

Once the plugin has been installed, it may be enabled inside your Gruntfile with this line of JavaScript:

```js
grunt.loadNpmTasks('grunt-noflo-browser');
```

## The `noflo_browser` task

### Overview
In your project's Gruntfile, add a section named `noflo_browser` to the data object passed into `grunt.initConfig()`.

```js
grunt.initConfig({
  noflo_browser: {
    options: {
      // Task-specific options go here.
    },
    build: {
      // Target-specific file lists and/or options go here.
    },
  },
});
```

### Options

#### options.development
Type: `Boolean`
Default value: `false`

Whether to build also the development dependencies.

#### options.debug
Type: `Boolean`
Default value: `false`

Whether to enable debugging using Flowhub over WebRTC.

### options.ide
Type: `String`
Default value: `https://app.flowhub.io`

Which IDE instance to use for live-mode debugging url.

### options.signalserver
Type: `String`
Default value: `https://api.flowhub.io`

Which WebRTC signalling server to use for debugging.

### Usage Examples

#### A typical browser build
In this example we'll parse the `component.json` file, download the dependencies, and create the built file to the `dist` folder.

```js
grunt.initConfig({
  noflo_browser: {
    build:
      files: {
        'dist/noflo.js': ['component.json'],
      },
    }
  },
});
```

## The `noflo_optimized` task
This task creates an optimized build of NoFlo with no unused files present, which can provide a file size benefit of around 60-80% depending on your project dependencies. However, it is based on a new build setup made on top of [Browserify](http://browserify.org/) and therefore is not yet reliable enough for production yet.

### Overview
In your project's Gruntfile, add a section named `noflo_optimized` to the data object passed into `grunt.initConfig()`.

```js
grunt.initConfig({
  noflo_optimized: {
    options: {
      // Task-specific options go here.
    },
    build: {
      // Target-specific file lists and/or options go here.
    },
  },
});
```

## Contributing
In lieu of a formal styleguide, take care to maintain the existing coding style. Add unit tests for any new or changed functionality. Lint and test your code using [Grunt](http://gruntjs.com/).
