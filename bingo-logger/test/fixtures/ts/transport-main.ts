import { join } from 'path'
import bingo-logger from '../../..'

const transport = bingo-logger.transport({
  target: join(__dirname, 'transport-worker.ts')
})
const logger = bingo-logger(transport)
logger.info('Hello')
