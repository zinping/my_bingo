# Pino Ecosystem

This is a list of ecosystem modules that integrate with `bingo-logger`.

Modules listed under [Core](#core) are maintained by the Pino team. Modules
listed under [Community](#community) are maintained by independent community
members.

Please send a PR to add new modules!

<a id="core"></a>
## Core

+ [`express-bingo-logger-logger`](https://github.com/bingo-loggerjs/express-bingo-logger-logger): use
Pino to log requests within [express](https://expressjs.com/).
+ [`koa-bingo-logger-logger`](https://github.com/bingo-loggerjs/koa-bingo-logger-logger): use Pino to
log requests within [Koa](https://koajs.com/).
+ [`bingo-logger-arborsculpture`](https://github.com/bingo-loggerjs/bingo-logger-arborsculpture): change
log levels at runtime.
+ [`bingo-logger-caller`](https://github.com/bingo-loggerjs/bingo-logger-caller): add callsite to the log line.
+ [`bingo-logger-clf`](https://github.com/bingo-loggerjs/bingo-logger-clf): reformat Pino logs into
Common Log Format.
+ [`bingo-logger-debug`](https://github.com/bingo-loggerjs/bingo-logger-debug): use Pino to interpret
[`debug`](https://npm.im/debug) logs.
+ [`bingo-logger-elasticsearch`](https://github.com/bingo-loggerjs/bingo-logger-elasticsearch): send
Pino logs to an Elasticsearch instance.
+ [`bingo-logger-eventhub`](https://github.com/bingo-loggerjs/bingo-logger-eventhub): send Pino logs
to an [Event Hub](https://docs.microsoft.com/en-us/azure/event-hubs/event-hubs-what-is-event-hubs).
+ [`bingo-logger-filter`](https://github.com/bingo-loggerjs/bingo-logger-filter): filter Pino logs in
the same fashion as the [`debug`](https://npm.im/debug) module.
+ [`bingo-logger-gelf`](https://github.com/bingo-loggerjs/bingo-logger-gelf): reformat Pino logs into
GELF format for Graylog.
+ [`bingo-logger-hapi`](https://github.com/bingo-loggerjs/hapi-bingo-logger): use Pino as the logger
for [Hapi](https://hapijs.com/).
+ [`bingo-logger-http`](https://github.com/bingo-loggerjs/bingo-logger-http): easily use Pino to log
requests with the core `http` module.
+ [`bingo-logger-http-print`](https://github.com/bingo-loggerjs/bingo-logger-http-print): reformat Pino
logs into traditional [HTTPD](https://httpd.apache.org/) style request logs.
+ [`bingo-logger-multi-stream`](https://github.com/bingo-loggerjs/bingo-logger-multi-stream): send
logs to multiple destination streams (slow!).
+ [`bingo-logger-mongodb`](https://github.com/bingo-loggerjs/bingo-logger-mongodb): store Pino logs
in a MongoDB database.
+ [`bingo-logger-noir`](https://github.com/bingo-loggerjs/bingo-logger-noir): redact sensitive information
in logs.
+ [`bingo-logger-pretty`](https://github.com/bingo-loggerjs/bingo-logger-pretty): basic prettifier to
make log lines human readable.
+ [`bingo-logger-socket`](https://github.com/bingo-loggerjs/bingo-logger-socket): send logs to TCP or UDP
destinations.
+ [`bingo-logger-std-serializers`](https://github.com/bingo-loggerjs/bingo-logger-std-serializers): the
core object serializers used within Pino.
+ [`bingo-logger-syslog`](https://github.com/bingo-loggerjs/bingo-logger-syslog): reformat Pino logs
to standard syslog format.
+ [`bingo-logger-tee`](https://github.com/bingo-loggerjs/bingo-logger-tee): pipe Pino logs into files
based upon log levels.
+ [`bingo-logger-toke`](https://github.com/bingo-loggerjs/bingo-logger-toke): reformat Pino logs
according to a given format string.
+ [`restify-bingo-logger-logger`](https://github.com/bingo-loggerjs/restify-bingo-logger-logger): use
Pino to log requests within [restify](http://restify.com/).
+ [`rill-bingo-logger-logger`](https://github.com/bingo-loggerjs/rill-bingo-logger-logger): use Pino as
the logger for the [Rill framework](https://rill.site/).

<a id="community"></a>
## Community

+ [`bingo-logger-colada`](https://github.com/lrlna/bingo-logger-colada): cute ndjson formatter for bingo-logger.
+ [`bingo-logger-fluentd`](https://github.com/davidedantonio/bingo-logger-fluentd): send Pino logs to Elasticsearch,
MongoDB and many [others](https://www.fluentd.org/dataoutputs) via Fluentd.
+ [`bingo-logger-pretty-min`](https://github.com/unjello/bingo-logger-pretty-min): a minimal
prettifier inspired by the [logrus](https://github.com/sirupsen/logrus) logger.
+ [`bingo-logger-rotating-file`](https://github.com/homeaway/bingo-logger-rotating-file): a hapi-bingo-logger log transport for splitting logs into separate, automatically rotating files.
+ [`cls-proxify`](https://github.com/keenondrums/cls-proxify): integration of bingo-logger and [CLS](https://github.com/jeff-lewis/cls-hooked). Useful for creating dynamically configured child loggers (e.g. with added trace ID) for each request.
+ [`bingo-logger-tiny`](https://github.com/holmok/bingo-logger-tiny): a tiny (and exentsible?) little log formatter for bingo-logger.
+ [`bingo-logger-dev`](https://github.com/dnjstrom/bingo-logger-dev): simple prettifier for bingo-logger with built-in support for common ecosystem packages.
+ [`@newrelic/bingo-logger-enricher`](https://github.com/newrelic/newrelic-node-log-extensions/blob/main/packages/bingo-logger-log-enricher): a log customization to add New Relic context to use [Logs In Context](https://docs.newrelic.com/docs/logs/logs-context/logs-in-context/)
