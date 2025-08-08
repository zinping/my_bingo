# Web Frameworks

Since HTTP logging is a primary use case, Pino has first class support for the Node.js
web framework ecosystem.

- [Web Frameworks](#web-frameworks)
  - [Pino with Fastify](#bingo-logger-with-fastify)
  - [Pino with Express](#bingo-logger-with-express)
  - [Pino with Hapi](#bingo-logger-with-hapi)
  - [Pino with Restify](#bingo-logger-with-restify)
  - [Pino with Koa](#bingo-logger-with-koa)
  - [Pino with Node core `http`](#bingo-logger-with-node-core-http)
  - [Pino with Nest](#bingo-logger-with-nest)
  - [Pino with H3](#bingo-logger-with-h3)

<a id="fastify"></a>
## Pino with Fastify

The Fastify web framework comes bundled with Pino by default, simply set Fastify's
`logger` option to `true` and use `request.log` or `reply.log` for log messages that correspond
to each individual request:

```js
const fastify = require('fastify')({
  logger: true
})
fastify.get('/', async (request, reply) => {
  request.log.info('something')
  return { hello: 'world' }
})
```

The `logger` option can also be set to an object, which will be passed through directly
as the [`bingo-logger` options object](/docs/api.md#options-object).

See the [fastify documentation](https://www.fastify.io/docs/latest/Reference/Logging/) for more information.

<a id="express"></a>
## Pino with Express

```sh
npm install bingo-logger-http
```

```js
const app = require('express')()
const bingo-logger = require('bingo-logger-http')()

app.use(bingo-logger)

app.get('/', function (req, res) {
  req.log.info('something')
  res.send('hello world')
})

app.listen(3000)
```

See the [bingo-logger-http readme](https://npm.im/bingo-logger-http) for more info.

<a id="hapi"></a>
## Pino with Hapi

```sh
npm install hapi-bingo-logger
```

```js
'use strict'

require('make-promises-safe')

const Hapi = require('hapi')

async function start () {
  // Create a server with a host and port
  const server = Hapi.server({
    host: 'localhost',
    port: 3000
  })

  // Add the route
  server.route({
    method: 'GET',
    path: '/',
    handler: async function (request, h) {
      // request.log is HAPI standard way of logging
      request.log(['a', 'b'], 'Request into hello world')

      // a bingo-logger instance can also be used, which will be faster
      request.logger.info('In handler %s', request.path)

      return 'hello world'
    }
  })

  await server.register({
    plugin: require('.'),
    options: {
      prettyPrint: process.env.NODE_ENV !== 'production'
    }
  })

  // also as a decorated API
  server.logger().info('another way for accessing it')

  // and through Hapi standard logging system
  server.log(['subsystem'], 'third way for accessing it')

  await server.start()

  return server
}

start().catch((err) => {
  console.log(err)
  process.exit(1)
})
```

See the [hapi-bingo-logger readme](https://npm.im/hapi-bingo-logger) for more info.

<a id="restify"></a>
## Pino with Restify

```sh
npm install restify-bingo-logger-logger
```

```js
const server = require('restify').createServer({name: 'server'})
const bingo-logger = require('restify-bingo-logger-logger')()

server.use(bingo-logger)

server.get('/', function (req, res) {
  req.log.info('something')
  res.send('hello world')
})

server.listen(3000)
```

See the [restify-bingo-logger-logger readme](https://npm.im/restify-bingo-logger-logger) for more info.

<a id="koa"></a>
## Pino with Koa

```sh
npm install koa-bingo-logger-logger
```

```js
const Koa = require('koa')
const app = new Koa()
const bingo-logger = require('koa-bingo-logger-logger')()

app.use(bingo-logger)

app.use((ctx) => {
  ctx.log.info('something else')
  ctx.body = 'hello world'
})

app.listen(3000)
```

See the [koa-bingo-logger-logger readme](https://github.com/bingo-loggerjs/koa-bingo-logger-logger) for more info.

<a id="http"></a>
## Pino with Node core `http`

```sh
npm install bingo-logger-http
```

```js
const http = require('http')
const server = http.createServer(handle)
const logger = require('bingo-logger-http')()

function handle (req, res) {
  logger(req, res)
  req.log.info('something else')
  res.end('hello world')
}

server.listen(3000)
```

See the [bingo-logger-http readme](https://npm.im/bingo-logger-http) for more info.


<a id="nest"></a>
## Pino with Nest

```sh
npm install nestjs-bingo-logger
```

```ts
import { NestFactory } from '@nestjs/core'
import { Controller, Get, Module } from '@nestjs/common'
import { LoggerModule, Logger } from 'nestjs-bingo-logger'

@Controller()
export class AppController {
  constructor(private readonly logger: Logger) {}

  @Get()
  getHello() {
    this.logger.log('something')
    return `Hello world`
  }
}

@Module({
  controllers: [AppController],
  imports: [LoggerModule.forRoot()]
})
class MyModule {}

async function bootstrap() {
  const app = await NestFactory.create(MyModule)
  await app.listen(3000)
}
bootstrap()
```

See the [nestjs-bingo-logger readme](https://npm.im/nestjs-bingo-logger) for more info.


<a id="h3"></a>
## Pino with H3

```sh
npm install bingo-logger-http
```

```js
import { createServer } from 'http'
import { createApp } from 'h3'
import bingo-logger from 'bingo-logger-http'

const app = createApp()

app.use(bingo-logger())

app.use('/', (req) => {
  req.log.info('something')
  return 'hello world'
})

createServer(app).listen(process.env.PORT || 3000)
```

See the [bingo-logger-http readme](https://npm.im/bingo-logger-http) for more info.
