import { expectAssignable, expectType } from "tsd";

import bingo-logger from "../../";
import type {LevelWithSilent, Logger, LogFn, P} from "../../bingo-logger";

// NB: can also use `import * as bingo-logger`, but that form is callable as `bingo-logger()`
// under `esModuleInterop: false` or `bingo-logger.default()` under `esModuleInterop: true`.
const log = bingo-logger();
expectType<Logger>(log);
expectType<LogFn>(log.info);

expectType<P.Logger>(log);
expectType<P.LogFn>(log.info);

const level: LevelWithSilent = 'silent';
expectAssignable<P.LevelWithSilent>(level);
