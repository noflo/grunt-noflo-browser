# grunt-noflo-browser

> Grunt plugin for building NoFlo projects for the browser. It also extracts possible HTML contents from graphs and creates demo files for them. It uses [Webpack](https://webpack.github.io/) for building.

grunt-noflo-browser can also be used for creating single-file executable bundles of Node.js projects. This can increase start-up time, especially in constrained environments.

## Getting Started
This plugin requires Grunt `1.x`

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

#### options.graph
Type: `String`
Default value: `null`

Setting this to the component name of a graph scopes the build to only include dependencies of that graph. If set to null, all available components will be included.

#### options.webpack
Type: `Object`

[Webpack configuration options](http://webpack.github.io/docs/configuration.html) to use with the build.

#### options.ignores
Type: `Array`
Default value: `[/tv4/]`

List of regular expressions matching modules to ignore in the build. Can be used to remove optional dependencies.

#### options.manifest
Type: `Object`

Custom options to pass to [fbp-manifest](https://github.com/flowbased/fbp-manifest) at component discovery stage.

#### options.development
Type: `Boolean`
Default value: `false`

Whether to build also the development dependencies.

#### options.debug
Type: `Boolean`
Default value: `false`

Whether to enable debugging using Flowhub over `postMessage` transport. Requires `noflo-runtime-postmessage` module to be installed.

### options.ide
Type: `String`
Default value: `https://app.flowhub.io`

Which IDE instance to use for live-mode debugging url.

### Usage Examples

#### A typical browser build
In this example we'll parse the `package.json` file, download the dependencies, and create the built file to the `dist` folder.

```js
grunt.initConfig({
  noflo_browser: {
    options: {},
    build: {
      files: {
        'dist/noflo.js': ['package.json'],
      },
    }
  },
});
```

This generated file will provide a `window.require` function that can be used for loading NoFlo.

## Contributing
In lieu of a formal styleguide, take care to maintain the existing coding style. Add unit tests for any new or changed functionality. Lint and test your code using [Grunt](http://gruntjs.com/).
