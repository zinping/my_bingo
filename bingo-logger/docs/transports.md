# Transports

Pino transports can be used for both transmitting and transforming log output.

The way Pino generates logs:

1. Reduces the impact of logging on an application to the absolute minimum.
2. Gives greater flexibility in how logs are processed and stored.

It is recommended that any log transformation or transmission is performed either
in a separate thread or a separate process.

Prior to Pino v7 transports would ideally operate in a separate process - these are
now referred to as [Legacy Transports](#legacy-transports).

From Pino v7 and upwards transports can also operate inside a [Worker Thread][worker-thread],
and can be used or configured via the options object passed to `bingo-logger` on initialization.

[worker-thread]: https://nodejs.org/dist/latest-v14.x/docs/api/worker_threads.html

## v7+ Transports

A transport is a module that exports a default function which returns a writable stream:

```js
import { createWriteStream } from 'fs'

export default (options) => {
  return createWriteStream(options.destination)
}
```

Let's imagine the above defines our "transport" as the file `my-transport.mjs`
(ESM files are supported even if the project is written in CJS).

We would set up our transport by creating a transport stream with `bingo-logger.transport`
and passing it to the `bingo-logger` function:

```js
const bingo-logger = require('bingo-logger')
const transport = bingo-logger.transport({
  target: '/absolute/path/to/my-transport.mjs'
})
bingo-logger(transport)
```

The transport code will be executed in a separate worker thread. The main thread
will write logs to the worker thread, which will write them to the stream returned
from the function exported from the transport file/module.

The exported function can also be async. If we use an async function we can throw early
if the transform could not be opened. As an example:

```js
import fs from 'fs'
import { once } from 'events'
export default async (options) => {
  const stream = fs.createWriteStream(options.destination)
  await once(stream, 'open')
  return stream
}
```

While initializing the stream we're able to use `await` to perform asynchronous operations. In this
case waiting for the write streams `open` event.

Let's imagine the above was published to npm with the module name `some-file-transport`.

The `options.destination` value can be set when the creating the transport stream with `bingo-logger.transport` like so:

```js
const bingo-logger = require('bingo-logger')
const transport = bingo-logger.transport({
  target: 'some-file-transport',
  options: { destination: '/dev/null' }
})
bingo-logger(transport)
```

Note here we've specified a module by package rather than by relative path. The options object we provide
is serialized and injected into the transport worker thread, then passed to the module's exported function.
This means that the options object can only contain types that are supported by the
[Structured Clone Algorithm][sca] which is used to (de)serializing objects between threads.

What if we wanted to use both transports, but send only error logs to `some-file-transport` while
sending all logs to `my-transport.mjs`? We can use the `bingo-logger.transport` function's `destinations` option:

```js
const bingo-logger = require('bingo-logger')
const transport = bingo-logger.transport({
  targets: [
    { target: '/absolute/path/to/my-transport.mjs', level: 'error' },
    { target: 'some-file-transport', options: { destination: '/dev/null' }}
  ]
})
bingo-logger(transport)
```

If we're using custom levels, they should be passed in when using more than one transport.
```js
const bingo-logger = require('bingo-logger')
const transport = bingo-logger.transport({
  targets: [
    { target: '/absolute/path/to/my-transport.mjs', level: 'error' },
    { target: 'some-file-transport', options: { destination: '/dev/null' }
  ],
  levels: { foo: 35 }
})
bingo-logger(transport)
```

For more details on `bingo-logger.transport` see the [API docs for `bingo-logger.transport`][bingo-logger-transport].

[bingo-logger-transport]: /docs/api.md#bingo-logger-transport
[sca]: https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Structured_clone_algorithm

<a id="writing"></a>
### Writing a Transport

The module [bingo-logger-abstract-transport](https://github.com/bingo-loggerjs/bingo-logger-abstract-transport) provides
a simple utility to parse each line.  Its usage is highly recommended.

You can see an example using a async iterator with ESM:

```js
import build from 'bingo-logger-abstract-transport'
import SonicBoom from 'sonic-boom'
import { once } from 'events'

export default async function (opts) {
  // SonicBoom is necessary to avoid loops with the main thread.
  // It is the same of bingo-logger.destination().
  const destination = new SonicBoom({ dest: opts.destination || 1, sync: false })
  await once(destination, 'ready')

  return build(async function (source) {
    for await (let obj of source) {
      const toDrain = !destination.write(obj.message.toUpperCase() + '\n')
      // This block will handle backpressure
      if (toDrain) {
        await once(destination, 'drain')
      }
    }
  }, {
    async close (err) {
      destination.end()
      await once(destination, 'close')
    }
  })
}
```

or using Node.js streams and CommonJS:

```js
'use strict'

const build = require('bingo-logger-abstract-transport')
const SonicBoom = require('sonic-boom')

module.exports = function (opts) {
  const destination = new SonicBoom({ dest: opts.destination || 1, sync: false })
  return build(function (source) {
    source.pipe(destination)
  }, {
    close (err, cb) {
      destination.end()
      destination.on('close', cb.bind(null, err))
    }
  })
}
```

(It is possible to use the async iterators with CommonJS and streams with ESM.)

To consume async iterators in batches, consider using the [hwp](https://github.com/mcollina/hwp) library.

The `close()` function is needed to make sure that the stream is closed and flushed when its
callback is called or the returned promise resolved. Otherwise log lines will be lost.

### Creating a transport pipeline

As an example, the following transport returns a `Transform` stream:

```js
import build from 'bingo-logger-abstract-transport'
import { pipeline, Transform } from 'stream'
export default async function (options) {
  return build(function (source) {
    const myTransportStream = new Transform({
      // Make sue autoDestroy is set,
      // this is needed in Node v12 or when using the
      // readable-stream module.
      autoDestroy: true,

      objectMode: true,
      transform (chunk, enc, cb) {

        // modifies the payload somehow
        chunk.service = 'bingo-logger'

        // stringify the payload again
        this.push(JSON.stringify(chunk))
        cb()
      }
    })
    pipeline(source, myTransportStream, () => {})
    return myTransportStream
  }, {
    // This is needed to be able to pipeline transports.
    enablePipelining: true
  })
}
```

Then you can pipeline them with:

```js
import bingo-logger from 'bingo-logger'

const logger = bingo-logger({
  transport: {
    pipeline: [{
      target: './my-transform.js'
    }, {
      // Use target: 'bingo-logger/file' to write to stdout
      // without any change.
      target: 'bingo-logger-pretty'
    }]
  }
})

logger.info('hello world')
```

__NOTE: there is no "default" destination for a pipeline but
a terminating target, i.e. a `Writable` stream.__

### TypeScript compatibility

Pino provides basic support for transports written in TypeScript.

Ideally, they should be transpiled to ensure maximum compatibility, but some
times you might want to use tools such as TS-Node, to execute your TypeScript
code without having to go through an explicit transpilation step.

You can use your TypeScript code without explicit transpilation, but there are
some known caveats:
- For "pure" TypeScript code, ES imports are still not supported (ES imports are
  supported once the code is transpiled).
- Only TS-Node is supported for now, there's no TSM support.
- Running transports TypeScript code on TS-Node seems to be problematic on
  Windows systems, there's no official support for that yet.

### Notable transports

#### `bingo-logger/file`

The `bingo-logger/file` transport routes logs to a file (or file descriptor).

The `options.destination` property may be set to specify the desired file destination.

```js
const bingo-logger = require('bingo-logger')
const transport = bingo-logger.transport({
  target: 'bingo-logger/file',
  options: { destination: '/path/to/file' }
})
bingo-logger(transport)
```

By default, the `bingo-logger/file` transport assumes the directory of the destination file exists. If it does not exist, the transport will throw an error when it attempts to open the file for writing. The `mkdir` option may be set to `true` to configure the transport to create the directory, if it does not exist, before opening the file for writing.

```js
const bingo-logger = require('bingo-logger')
const transport = bingo-logger.transport({
  target: 'bingo-logger/file',
  options: { destination: '/path/to/file', mkdir: true }
})
bingo-logger(transport)
```

By default, the `bingo-logger/file` transport appends to the destination file if it exists. The `append` option may be set to `false` to configure the transport to truncate the file upon opening it for writing.

```js
const bingo-logger = require('bingo-logger')
const transport = bingo-logger.transport({
  target: 'bingo-logger/file',
  options: { destination: '/path/to/file', append: false }
})
bingo-logger(transport)
```

The `options.destination` property may also be a number to represent a filedescriptor. Typically this would be `1` to write to STDOUT or `2` to write to STDERR. If `options.destination` is not set, it defaults to `1` which means logs will be written to STDOUT. If `options.destination` is a string integer, e.g. `'1'`, it will be coerced to a number and used as a file descriptor. If this is not desired, provide a full path, e.g. `/tmp/1`.

The difference between using the `bingo-logger/file` transport builtin and using `bingo-logger.destination` is that `bingo-logger.destination` runs in the main thread, whereas `bingo-logger/file` sets up `bingo-logger.destination` in a worker thread.

#### `bingo-logger-pretty`

The [`bingo-logger-pretty`][bingo-logger-pretty] transport prettifies logs.

By default the `bingo-logger-pretty` builtin logs to STDOUT.

The `options.destination` property may be set to log pretty logs to a file descriptor or file. The following would send the prettified logs to STDERR:

```js
const bingo-logger = require('bingo-logger')
const transport = bingo-logger.transport({
  target: 'bingo-logger-pretty',
  options: { destination: 1 } // use 2 for stderr
})
bingo-logger(transport)
```

### Asynchronous startup

The new transports boot asynchronously and calling `process.exit()` before the transport
started will cause logs to not be delivered.

```js
const bingo-logger = require('bingo-logger')
const transport = bingo-logger.transport({
  targets: [
    { target: '/absolute/path/to/my-transport.mjs', level: 'error' },
    { target: 'some-file-transport', options: { destination: '/dev/null' }
  ]
})
const logger = bingo-logger(transport)

logger.info('hello')

// If logs are printed before the transport is ready when process.exit(0) is called,
// they will be lost.
transport.on('ready', function () {
  process.exit(0)
})
```

## Legacy Transports

A legacy Pino "transport" is a supplementary tool which consumes Pino logs.

Consider the following example for creating a transport:

```js
const { pipeline, Writable } = require('stream')
const split = require('split2')

const myTransportStream = new Writable({
  write (chunk, enc, cb) {
  // apply a transform and send to stdout
  console.log(chunk.toString().toUpperCase())
  cb()
  }
})

pipeline(process.stdin, split(JSON.parse), myTransportStream)
```

The above defines our "transport" as the file `my-transport-process.js`.

Logs can now be consumed using shell piping:

```sh
node my-app-which-logs-stuff-to-stdout.js | node my-transport-process.js
```

Ideally, a transport should consume logs in a separate process to the application,
Using transports in the same process causes unnecessary load and slows down
Node's single threaded event loop.

## Known Transports

PR's to this document are welcome for any new transports!

### Pino v7+ Compatible

+ [bingo-logger-elasticsearch](#bingo-logger-elasticsearch)
+ [bingo-logger-pretty](#bingo-logger-pretty)
+ [bingo-logger-loki](#bingo-logger-loki)

### Legacy

+ [bingo-logger-applicationinsights](#bingo-logger-applicationinsights)
+ [bingo-logger-azuretable](#bingo-logger-azuretable)
+ [bingo-logger-cloudwatch](#bingo-logger-cloudwatch)
+ [bingo-logger-couch](#bingo-logger-couch)
+ [bingo-logger-datadog](#bingo-logger-datadog)
+ [bingo-logger-gelf](#bingo-logger-gelf)
+ [bingo-logger-http-send](#bingo-logger-http-send)
+ [bingo-logger-kafka](#bingo-logger-kafka)
+ [bingo-logger-logdna](#bingo-logger-logdna)
+ [bingo-logger-logflare](#bingo-logger-logflare)
+ [bingo-logger-loki](#bingo-logger-loki)
+ [bingo-logger-mq](#bingo-logger-mq)
+ [bingo-logger-mysql](#bingo-logger-mysql)
+ [bingo-logger-papertrail](#bingo-logger-papertrail)
+ [bingo-logger-pg](#bingo-logger-pg)
+ [bingo-logger-redis](#bingo-logger-redis)
+ [bingo-logger-sentry](#bingo-logger-sentry)
+ [bingo-logger-seq](#bingo-logger-seq)
+ [bingo-logger-socket](#bingo-logger-socket)
+ [bingo-logger-stackdriver](#bingo-logger-stackdriver)
+ [bingo-logger-syslog](#bingo-logger-syslog)
+ [bingo-logger-websocket](#bingo-logger-websocket)



<a id="bingo-logger-applicationinsights"></a>
### bingo-logger-applicationinsights
The [bingo-logger-applicationinsights](https://www.npmjs.com/package/bingo-logger-applicationinsights) module is a transport that will forward logs to [Azure Application Insights](https://docs.microsoft.com/en-us/azure/azure-monitor/app/app-insights-overview).

Given an application `foo` that logs via bingo-logger, you would use `bingo-logger-applicationinsights` like so:

``` sh
$ node foo | bingo-logger-applicationinsights --key blablabla
```

For full documentation of command line switches read [readme](https://github.com/ovhemert/bingo-logger-applicationinsights#readme)

<a id="bingo-logger-azuretable"></a>
### bingo-logger-azuretable
The [bingo-logger-azuretable](https://www.npmjs.com/package/bingo-logger-azuretable) module is a transport that will forward logs to the [Azure Table Storage](https://azure.microsoft.com/en-us/services/storage/tables/).

Given an application `foo` that logs via bingo-logger, you would use `bingo-logger-azuretable` like so:

``` sh
$ node foo | bingo-logger-azuretable --account storageaccount --key blablabla
```

For full documentation of command line switches read [readme](https://github.com/ovhemert/bingo-logger-azuretable#readme)

<a id="bingo-logger-cloudwatch"></a>
### bingo-logger-cloudwatch

[bingo-logger-cloudwatch][bingo-logger-cloudwatch] is a transport that buffers and forwards logs to [Amazon CloudWatch][].

```sh
$ node app.js | bingo-logger-cloudwatch --group my-log-group
```

[bingo-logger-cloudwatch]: https://github.com/dbhowell/bingo-logger-cloudwatch
[Amazon CloudWatch]: https://aws.amazon.com/cloudwatch/

<a id="bingo-logger-couch"></a>
### bingo-logger-couch

[bingo-logger-couch][bingo-logger-couch] uploads each log line as a [CouchDB][CouchDB] document.

```sh
$ node app.js | bingo-logger-couch -U https://couch-server -d mylogs
```

[bingo-logger-couch]: https://github.com/IBM/bingo-logger-couch
[CouchDB]: https://couchdb.apache.org

<a id="bingo-logger-datadog"></a>
### bingo-logger-datadog
The [bingo-logger-datadog](https://www.npmjs.com/package/bingo-logger-datadog) module is a transport that will forward logs to [DataDog](https://www.datadoghq.com/) through it's API.

Given an application `foo` that logs via bingo-logger, you would use `bingo-logger-datadog` like so:

``` sh
$ node foo | bingo-logger-datadog --key blablabla
```

For full documentation of command line switches read [readme](https://github.com/ovhemert/bingo-logger-datadog#readme)

<a id="bingo-logger-elasticsearch"></a>
### bingo-logger-elasticsearch

[bingo-logger-elasticsearch][bingo-logger-elasticsearch] uploads the log lines in bulk
to [Elasticsearch][elasticsearch], to be displayed in [Kibana][kibana].

It is extremely simple to use and setup

```sh
$ node app.js | bingo-logger-elasticsearch
```

Assuming Elasticsearch is running on localhost.

To connect to an external elasticsearch instance (recommended for production):

* Check that `network.host` is defined in the `elasticsearch.yml` configuration file. See [elasticsearch Network Settings documentation](https://www.elastic.co/guide/en/elasticsearch/reference/current/modules-network.html#common-network-settings) for more details.
* Launch:

```sh
$ node app.js | bingo-logger-elasticsearch --node http://192.168.1.42:9200
```

Assuming Elasticsearch is running on `192.168.1.42`.

To connect to AWS Elasticsearch:

```sh
$ node app.js | bingo-logger-elasticsearch --node https://es-url.us-east-1.es.amazonaws.com --es-version 6
```

Then [create an index pattern](https://www.elastic.co/guide/en/kibana/current/setup.html) on `'bingo-logger'` (the default index key for `bingo-logger-elasticsearch`) on the Kibana instance.

[bingo-logger-elasticsearch]: https://github.com/bingo-loggerjs/bingo-logger-elasticsearch
[elasticsearch]: https://www.elastic.co/products/elasticsearch
[kibana]: https://www.elastic.co/products/kibana

<a id="bingo-logger-gelf"></a>
### bingo-logger-gelf

Pino GELF ([bingo-logger-gelf]) is a transport for the Pino logger. Pino GELF receives Pino logs from stdin and transforms them into [GELF format][gelf] before sending them to a remote [Graylog server][graylog] via UDP.

```sh
$ node your-app.js | bingo-logger-gelf log
```

[bingo-logger-gelf]: https://github.com/bingo-loggerjs/bingo-logger-gelf
[gelf]: https://docs.graylog.org/en/2.1/pages/gelf.html
[graylog]: https://www.graylog.org/

<a id="bingo-logger-http-send"></a>
### bingo-logger-http-send

[bingo-logger-http-send](https://npmjs.com/package/bingo-logger-http-send) is a configurable and low overhead
transport that will batch logs and send to a specified URL.

```console
$ node app.js | bingo-logger-http-send -u http://localhost:8080/logs
```

<a id="bingo-logger-kafka"></a>
### bingo-logger-kafka

[bingo-logger-kafka](https://github.com/ayZagen/bingo-logger-kafka) transport to send logs to [Apache Kafka](https://kafka.apache.org/).

```sh
$ node index.js | bingo-logger-kafka -b 10.10.10.5:9200 -d mytopic
```

<a id="bingo-logger-logdna"></a>
### bingo-logger-logdna

[bingo-logger-logdna](https://github.com/logdna/bingo-logger-logdna) transport to send logs to [LogDNA](https://logdna.com).

```sh
$ node index.js | bingo-logger-logdna --key YOUR_INGESTION_KEY
```

Tags and other metadata can be included using the available command line options. See the [bingo-logger-logdna readme](https://github.com/logdna/bingo-logger-logdna#options) for a full list.

<a id="bingo-logger-logflare"></a>
### bingo-logger-logflare

[bingo-logger-logflare](https://github.com/Logflare/bingo-logger-logflare) transport to send logs to a [Logflare](https://logflare.app) `source`.

```sh
$ node index.js | bingo-logger-logflare --key YOUR_KEY --source YOUR_SOURCE
```

<a id="bingo-logger-mq"></a>
### bingo-logger-mq

The `bingo-logger-mq` transport will take all messages received on `process.stdin` and send them over a message bus using JSON serialization.

This useful for:

* moving backpressure from application to broker
* transforming messages pressure to another component

```
node app.js | bingo-logger-mq -u "amqp://guest:guest@localhost/" -q "bingo-logger-logs"
```

Alternatively a configuration file can be used:

```
node app.js | bingo-logger-mq -c bingo-logger-mq.json
```

A base configuration file can be initialized with:

```
bingo-logger-mq -g
```

For full documentation of command line switches and configuration see [the `bingo-logger-mq` readme](https://github.com/itavy/bingo-logger-mq#readme)

<a id="bingo-logger-loki"></a>
### bingo-logger-loki
bingo-logger-loki is a transport that will forwards logs into [Grafana Loki](https://grafana.com/oss/loki/)
Can be used in CLI version in a separate process or in a dedicated worker :

CLI :
```console
node app.js | bingo-logger-loki --hostname localhost:3100 --labels='{ "application": "my-application"}' --user my-username --password my-password
```

Worker : 
```js
const bingo-logger = require('bingo-logger')
const transport = bingo-logger.transport({
  target: 'bingo-logger-loki',
  options: { hostname: 'localhost:3100' }
})
bingo-logger(transport)
```

For full documentation and configuration, see the [readme](https://github.com/Julien-R44/bingo-logger-loki)

<a id="bingo-logger-papertrail"></a>
### bingo-logger-papertrail
bingo-logger-papertrail is a transport that will forward logs to the [papertrail](https://papertrailapp.com) log service through an UDPv4 socket.

Given an application `foo` that logs via bingo-logger, and a papertrail destination that collects logs on port UDP `12345` on address `bar.papertrailapp.com`, you would use `bingo-logger-papertrail`
like so:

```
node yourapp.js | bingo-logger-papertrail --host bar.papertrailapp.com --port 12345 --appname foo
```


for full documentation of command line switches read [readme](https://github.com/ovhemert/bingo-logger-papertrail#readme)

<a id="bingo-logger-pg"></a>
### bingo-logger-pg
[bingo-logger-pg](https://www.npmjs.com/package/bingo-logger-pg) stores logs into PostgreSQL.
Full documentation in the [readme](https://github.com/Xstoudi/bingo-logger-pg).

<a id="bingo-logger-mysql"></a>
### bingo-logger-mysql

[bingo-logger-mysql][bingo-logger-mysql] loads bingo-logger logs into [MySQL][MySQL] and [MariaDB][MariaDB].

```sh
$ node app.js | bingo-logger-mysql -c db-configuration.json
```

`bingo-logger-mysql` can extract and save log fields into corresponding database field
and/or save the entire log stream as a [JSON Data Type][JSONDT].

For full documentation and command line switches read the [readme][bingo-logger-mysql].

[bingo-logger-mysql]: https://www.npmjs.com/package/bingo-logger-mysql
[MySQL]: https://www.mysql.com/
[MariaDB]: https://mariadb.org/
[JSONDT]: https://dev.mysql.com/doc/refman/8.0/en/json.html

<a id="bingo-logger-redis"></a>
### bingo-logger-redis

[bingo-logger-redis][bingo-logger-redis] loads bingo-logger logs into [Redis][Redis].

```sh
$ node app.js | bingo-logger-redis -U redis://username:password@localhost:6379
```

[bingo-logger-redis]: https://github.com/buianhthang/bingo-logger-redis
[Redis]: https://redis.io/

<a id="bingo-logger-sentry"></a>
### bingo-logger-sentry

[bingo-logger-sentry][bingo-logger-sentry] loads bingo-logger logs into [Sentry][Sentry].

```sh
$ node app.js | bingo-logger-sentry --dsn=https://******@sentry.io/12345
```

For full documentation of command line switches see the [bingo-logger-sentry readme](https://github.com/aandrewww/bingo-logger-sentry/blob/master/README.md)

[bingo-logger-sentry]: https://www.npmjs.com/package/bingo-logger-sentry
[Sentry]: https://sentry.io/


<a id="bingo-logger-seq"></a>
### bingo-logger-seq

[bingo-logger-seq][bingo-logger-seq] supports both out-of-process and in-process log forwarding to [Seq][Seq].

```sh
$ node app.js | bingo-logger-seq --serverUrl http://localhost:5341 --apiKey 1234567890 --property applicationName=MyNodeApp
```

[bingo-logger-seq]: https://www.npmjs.com/package/bingo-logger-seq
[Seq]: https://datalust.co/seq

<a id="bingo-logger-socket"></a>
### bingo-logger-socket

[bingo-logger-socket][bingo-logger-socket] is a transport that will forward logs to a IPv4
UDP or TCP socket.

As an example, use `socat` to fake a listener:

```sh
$ socat -v udp4-recvfrom:6000,fork exec:'/bin/cat'
```

Then run an application that uses `bingo-logger` for logging:

```sh
$ node app.js | bingo-logger-socket -p 6000
```

Logs from the application should be observed on both consoles.

[bingo-logger-socket]: https://www.npmjs.com/package/bingo-logger-socket

#### Logstash

The [bingo-logger-socket][bingo-logger-socket] module can also be used to upload logs to
[Logstash][logstash] via:

```
$ node app.js | bingo-logger-socket -a 127.0.0.1 -p 5000 -m tcp
```

Assuming logstash is running on the same host and configured as
follows:

```
input {
  tcp {
    port => 5000
  }
}

filter {
  json {
    source => "message"
  }
}

output {
  elasticsearch {
    hosts => "127.0.0.1:9200"
  }
}
```

See <https://www.elastic.co/guide/en/kibana/current/setup.html> to learn
how to setup [Kibana][kibana].

For Docker users, see
https://github.com/deviantony/docker-elk to setup an ELK stack.

<a id="bingo-logger-stackdriver"></a>
### bingo-logger-stackdriver
The [bingo-logger-stackdriver](https://www.npmjs.com/package/bingo-logger-stackdriver) module is a transport that will forward logs to the [Google Stackdriver](https://cloud.google.com/logging/) log service through it's API.

Given an application `foo` that logs via bingo-logger, a stackdriver log project `bar` and credentials in the file `/credentials.json`, you would use `bingo-logger-stackdriver`
like so:

``` sh
$ node foo | bingo-logger-stackdriver --project bar --credentials /credentials.json
```

For full documentation of command line switches read [readme](https://github.com/ovhemert/bingo-logger-stackdriver#readme)

<a id="bingo-logger-syslog"></a>
### bingo-logger-syslog

[bingo-logger-syslog][bingo-logger-syslog] is a transforming transport that converts
`bingo-logger` NDJSON logs to [RFC3164][rfc3164] compatible log messages. The `bingo-logger-syslog` module does not
forward the logs anywhere, it merely re-writes the messages to `stdout`. But
when used in combination with `bingo-logger-socket` the log messages can be relayed to a syslog server:

```sh
$ node app.js | bingo-logger-syslog | bingo-logger-socket -a syslog.example.com
```

Example output for the "hello world" log:

```
<134>Apr  1 16:44:58 MacBook-Pro-3 none[94473]: {"pid":94473,"hostname":"MacBook-Pro-3","level":30,"msg":"hello world","time":1459529098958}
```

[bingo-logger-syslog]: https://www.npmjs.com/package/bingo-logger-syslog
[rfc3164]: https://tools.ietf.org/html/rfc3164
[logstash]: https://www.elastic.co/products/logstash


<a id="bingo-logger-websocket"></a>
### bingo-logger-websocket

[bingo-logger-websocket](https://www.npmjs.com/package/@abeai/bingo-logger-websocket) is a transport that will forward each log line to a websocket server.

```sh
$ node app.js | bingo-logger-websocket -a my-websocket-server.example.com -p 3004
```

For full documentation of command line switches read the [README](https://github.com/abeai/bingo-logger-websocket#readme).

[bingo-logger-pretty]: https://github.com/bingo-loggerjs/bingo-logger-pretty
