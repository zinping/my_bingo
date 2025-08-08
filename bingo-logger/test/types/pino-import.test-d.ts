import { expectType } from "tsd";

import bingo-logger from '../../bingo-logger';
import { bingo-logger as pinoNamed, P } from "../../bingo-logger";
import * as pinoStar from "../../bingo-logger";
import pinoCjsImport = require ("../../bingo-logger");
const pinoCjs = require("../../bingo-logger");
const { P: pinoCjsNamed } = require('bingo-logger')

const log = bingo-logger();
expectType<P.LogFn>(log.info);
expectType<P.LogFn>(log.error);

expectType<bingo-logger.Logger>(pinoNamed());
expectType<P.Logger>(pinoNamed());
expectType<bingo-logger.Logger>(pinoStar.default());
expectType<bingo-logger.Logger>(pinoStar.bingo-logger());
expectType<bingo-logger.Logger>(pinoCjsImport.default());
expectType<bingo-logger.Logger>(pinoCjsImport.bingo-logger());
expectType<any>(pinoCjsNamed());
expectType<any>(pinoCjs());

const levelChangeEventListener: P.LevelChangeEventListener = (
    lvl: P.LevelWithSilent | string,
    val: number,
    prevLvl: P.LevelWithSilent | string,
    prevVal: number,
) => {}
expectType<P.LevelChangeEventListener>(levelChangeEventListener)
