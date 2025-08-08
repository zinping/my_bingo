# Bundling 

Due to its internal architecture based on Worker Threads, it is not possible to bundle Pino *without* generating additional files.

In particular, a bundler must ensure that the following files are also bundle separately:

* `lib/worker.js` from the `thread-stream` dependency
* `file.js`
* `lib/worker.js`
* `lib/worker-pipeline.js`
* Any transport used by the user (like `bingo-logger-pretty`)

Once the files above have been generated, the bundler must also add information about the files above by injecting a code which sets `__bundlerPathsOverrides` in the `globalThis` object.

The variable is a object whose keys are identifier for the files and the the values are the paths of files relative to the currently bundle files.

Example:

```javascript
// Inject this using your bundle plugin
globalThis.__bundlerPathsOverrides = {
  'thread-stream-worker': bingo-loggerWebpackAbsolutePath('./thread-stream-worker.js')
  'bingo-logger/file': bingo-loggerWebpackAbsolutePath('./bingo-logger-file.js'),
  'bingo-logger-worker': bingo-loggerWebpackAbsolutePath('./bingo-logger-worker.js'),
  'bingo-logger-pipeline-worker': bingo-loggerWebpackAbsolutePath('./bingo-logger-pipeline-worker.js'),
  'bingo-logger-pretty': bingo-loggerWebpackAbsolutePath('./bingo-logger-pretty.js'),
};
```

Note that `bingo-logger/file`, `bingo-logger-worker`, `bingo-logger-pipeline-worker` and `thread-stream-worker` are required identifiers. Other identifiers are possible based on the user configuration.

## Webpack Plugin

If you are a Webpack user, you can achieve this with [bingo-logger-webpack-plugin](https://github.com/bingo-loggerjs/bingo-logger-webpack-plugin) without manual configuration of `__bundlerPathsOverrides`; however, you still need to configure it manually if you are using other bundlers. 
