# grunt-noflo-browser [![Build Status](https://travis-ci.org/noflo/grunt-noflo-browser.svg?branch=master)](https://travis-ci.org/noflo/grunt-noflo-browser)

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

## The "noflo_browser" task

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

## Contributing
In lieu of a formal styleguide, take care to maintain the existing coding style. Add unit tests for any new or changed functionality. Lint and test your code using [Grunt](http://gruntjs.com/).
