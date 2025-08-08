import bingo-logger from '../../..'
import { join } from 'path'

const transport = bingo-logger.transport({
  target: join(__dirname, 'to-file-transport-with-transform.ts'),
  options: {
    destination: process.argv[2]
  }
})
const logger = bingo-logger(transport)

logger.info('Hello')
logger.info('World')

process.exit(0)
