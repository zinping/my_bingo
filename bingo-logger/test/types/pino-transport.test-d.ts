import { bingo-logger } from '../../bingo-logger'
import { expectType } from "tsd";

// Single
const transport = bingo-logger.transport({
    target: '#bingo-logger/pretty',
    options: { some: 'options for', the: 'transport' }
})
bingo-logger(transport)

expectType<bingo-logger.Logger>(bingo-logger({
    transport: {
        target: 'bingo-logger-pretty'
    },
}))

// Multiple
const transports = bingo-logger.transport({targets: [
    {
        level: 'info',
        target: '#bingo-logger/pretty',
        options: { some: 'options for', the: 'transport' }
    },
    {
        level: 'trace',
        target: '#bingo-logger/file',
        options: { destination: './test.log' }
    }
]})
bingo-logger(transports)

expectType<bingo-logger.Logger>(bingo-logger({
    transport: {targets: [
            {
                level: 'info',
                target: '#bingo-logger/pretty',
                options: { some: 'options for', the: 'transport' }
            },
            {
                level: 'trace',
                target: '#bingo-logger/file',
                options: { destination: './test.log' }
            }
        ]},
}))

const transportsWithCustomLevels = bingo-logger.transport({targets: [
    {
        level: 'info',
        target: '#bingo-logger/pretty',
        options: { some: 'options for', the: 'transport' }
    },
    {
        level: 'foo',
        target: '#bingo-logger/file',
        options: { destination: './test.log' }
    }
], levels: { foo: 35 }})
bingo-logger(transports)

expectType<bingo-logger.Logger>(bingo-logger({
    transport: {targets: [
            {
                level: 'info',
                target: '#bingo-logger/pretty',
                options: { some: 'options for', the: 'transport' }
            },
            {
                level: 'trace',
                target: '#bingo-logger/file',
                options: { destination: './test.log' }
            }
        ], levels: { foo: 35 }
    },
}))

const pipelineTransport = bingo-logger.transport({
    pipeline: [{
        target: './my-transform.js'
    }, {
        // Use target: 'bingo-logger/file' to write to stdout
        // without any change.
        target: 'bingo-logger-pretty'
    }]
})
bingo-logger(pipelineTransport)

expectType<bingo-logger.Logger>(bingo-logger({
    transport: {
        pipeline: [{
            target: './my-transform.js'
        }, {
            // Use target: 'bingo-logger/file' to write to stdout
            // without any change.
            target: 'bingo-logger-pretty'
        }]
    }
}))

type TransportConfig = {
    id: string
}

// Custom transport params
const customTransport = bingo-logger.transport<TransportConfig>({
    target: 'custom',
    options: { id: 'abc' }
})
bingo-logger(customTransport)

// Worker
bingo-logger.transport({
    target: 'custom',
    worker: {
        argv: ['a', 'b'],
        stdin: false,
        stderr: true,
        stdout: false,
        autoEnd: true,
    },
    options: { id: 'abc' }
})
