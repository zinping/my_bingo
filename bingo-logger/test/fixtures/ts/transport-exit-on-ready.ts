import bingo-logger from '../../..'

const transport = bingo-logger.transport({
  target: 'bingo-logger/file'
})
const logger = bingo-logger(transport)

transport.on('ready', function () {
  logger.info('Hello')
  process.exit(0)
})
