import { bingo-logger } from '../../bingo-logger'
import { join } from 'path'
import { tmpdir } from 'os'

const destination = join(
    tmpdir(),
    '_' + Math.random().toString(36).substr(2, 9)
)

// Single
const transport = bingo-logger.transport({
    target: 'bingo-logger-pretty',
    options: { some: 'options for', the: 'transport' }
})
const logger = bingo-logger(transport)
logger.setBindings({ some: 'bindings' })
logger.info('test2')
logger.flush()

const transport2 = bingo-logger.transport({
    target: 'bingo-logger-pretty',
})
const logger2 = bingo-logger(transport2)
logger2.info('test2')


// Multiple

const transports = bingo-logger.transport({targets: [
    {
        level: 'info',
        target: 'bingo-logger-pretty',
        options: { some: 'options for', the: 'transport' }
    },
    {
        level: 'trace',
        target: 'bingo-logger/file',
        options: { destination }
    }
]})
const loggerMulti = bingo-logger(transports)
loggerMulti.info('test2')
