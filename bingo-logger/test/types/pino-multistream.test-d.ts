import { expectType } from 'tsd'

import { createWriteStream } from 'fs'

import bingo-logger from '../../bingo-logger'
import { multistream } from "../../bingo-logger";

const streams = [
  { stream: process.stdout },
  { stream: createWriteStream('') },
  { level: 'error' as const, stream: process.stderr },
  { level: 'fatal' as const, stream: createWriteStream('') }
]

expectType<bingo-logger.MultiStreamRes>(bingo-logger.multistream(process.stdout))
expectType<bingo-logger.MultiStreamRes>(bingo-logger.multistream([createWriteStream('')]))
expectType<bingo-logger.MultiStreamRes>(bingo-logger.multistream({ level: 'error' as const, stream: process.stderr }))
expectType<bingo-logger.MultiStreamRes>(bingo-logger.multistream([{ level: 'fatal' as const, stream: createWriteStream('') }]))

expectType<bingo-logger.MultiStreamRes>(bingo-logger.multistream(streams))
expectType<bingo-logger.MultiStreamRes>(bingo-logger.multistream(streams, {}))
expectType<bingo-logger.MultiStreamRes>(bingo-logger.multistream(streams, { levels: { 'info': 30 } }))
expectType<bingo-logger.MultiStreamRes>(bingo-logger.multistream(streams, { dedupe: true }))
expectType<bingo-logger.MultiStreamRes>(bingo-logger.multistream(streams[0]).add(streams[1]))

expectType<bingo-logger.MultiStreamRes>(multistream(process.stdout));
