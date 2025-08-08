import P, { bingo-logger } from "../../";
import { IncomingMessage, ServerResponse } from "http";
import { Socket } from "net";
import { expectError } from 'tsd'
import Logger = P.Logger;

const log = bingo-logger();
const info = log.info;
const error = log.error;

info("hello world");
error("this is at error level");
info("the answer is %d", 42);
info({ obj: 42 }, "hello world");
info({ obj: 42, b: 2 }, "hello world");
info({ obj: { aa: "bbb" } }, "another");
setImmediate(info, "after setImmediate");
error(new Error("an error"));

const writeSym = bingo-logger.symbols.writeSym;

const testUniqSymbol = {
    [bingo-logger.symbols.needsMetadataGsym]: true,
}[bingo-logger.symbols.needsMetadataGsym];

const log2: P.Logger = bingo-logger({
    name: "myapp",
    safe: true,
    serializers: {
        req: bingo-logger.stdSerializers.req,
        res: bingo-logger.stdSerializers.res,
        err: bingo-logger.stdSerializers.err,
    },
});

bingo-logger({
    write(o) {},
});

bingo-logger({
    mixin() {
        return { customName: "unknown", customId: 111 };
    },
});

bingo-logger({
    mixin: () => ({ customName: "unknown", customId: 111 }),
});

bingo-logger({
    mixin: (context: object) => ({ customName: "unknown", customId: 111 }),
});

bingo-logger({
    mixin: (context: object, level: number) => ({ customName: "unknown", customId: 111 }),
});

bingo-logger({
    redact: { paths: [], censor: "SECRET" },
});

bingo-logger({
    redact: { paths: [], censor: () => "SECRET" },
});

bingo-logger({
    redact: { paths: [], censor: (value) => value },
});

bingo-logger({
    redact: { paths: [], censor: (value, path) => path.join() },
});

bingo-logger({
    depthLimit: 1
});

bingo-logger({
    edgeLimit: 1
});

bingo-logger({
    browser: {
        write(o) {},
    },
});

bingo-logger({
    browser: {
        write: {
            info(o) {},
            error(o) {},
        },
        serialize: true,
        asObject: true,
        transmit: {
            level: "fatal",
            send: (level, logEvent) => {
                level;
                logEvent.bindings;
                logEvent.level;
                logEvent.ts;
                logEvent.messages;
            },
        },
    },
});

bingo-logger({ base: null });
// @ts-expect-error
if ("bingo-logger" in log) console.log(`bingo-logger version: ${log.bingo-logger}`);

log.child({ a: "property" }).info("hello child!");
log.level = "error";
log.info("nope");
const child = log.child({ foo: "bar" });
child.info("nope again");
child.level = "info";
child.info("hooray");
log.info("nope nope nope");
log.child({ foo: "bar" }, { level: "debug" }).debug("debug!");
child.bindings();
const customSerializers = {
    test() {
        return "this is my serializer";
    },
};
bingo-logger().child({}, { serializers: customSerializers }).info({ test: "should not show up" });
const child2 = log.child({ father: true });
const childChild = child2.child({ baby: true });
const childRedacted = bingo-logger().child({}, { redact: ["path"] })
childRedacted.info({
  msg: "logged with redacted properties",
  path: "Not shown",
});
const childAnotherRedacted = bingo-logger().child({}, {
    redact: {
        paths: ["anotherPath"],
        censor: "Not the log you\re looking for",
    }
})
childAnotherRedacted.info({
    msg: "another logged with redacted properties",
    anotherPath: "Not shown",
});

log.level = "info";
if (log.levelVal === 30) {
    console.log("logger level is `info`");
}

const listener = (lvl: any, val: any, prevLvl: any, prevVal: any) => {
    console.log(lvl, val, prevLvl, prevVal);
};
log.on("level-change", (lvl, val, prevLvl, prevVal) => {
    console.log(lvl, val, prevLvl, prevVal);
});
log.level = "trace";
log.removeListener("level-change", listener);
log.level = "info";

bingo-logger.levels.values.error === 50;
bingo-logger.levels.labels[50] === "error";

const logstderr: bingo-logger.Logger = bingo-logger(process.stderr);
logstderr.error("on stderr instead of stdout");

log.useLevelLabels = true;
log.info("lol");
log.level === "info";
const isEnabled: boolean = log.isLevelEnabled("info");

const redacted = bingo-logger({
    redact: ["path"],
});

redacted.info({
    msg: "logged with redacted properties",
    path: "Not shown",
});

const anotherRedacted = bingo-logger({
    redact: {
        paths: ["anotherPath"],
        censor: "Not the log you\re looking for",
    },
});

anotherRedacted.info({
    msg: "another logged with redacted properties",
    anotherPath: "Not shown",
});

const pretty = bingo-logger({
    prettyPrint: {
        colorize: true,
        crlf: false,
        errorLikeObjectKeys: ["err", "error"],
        errorProps: "",
        messageFormat: false,
        ignore: "",
        levelFirst: false,
        messageKey: "msg",
        timestampKey: "timestamp",
        translateTime: "UTC:h:MM:ss TT Z",
    },
});

const withMessageFormatFunc = bingo-logger({
    prettyPrint: {
        ignore: "requestId",
        messageFormat: (log, messageKey: string) => {
            const message = log[messageKey] as string;
            if (log.requestId) return `[${log.requestId}] ${message}`;
            return message;
        },
    },
});

const withTimeFn = bingo-logger({
    timestamp: bingo-logger.stdTimeFunctions.isoTime,
});

const withNestedKey = bingo-logger({
    nestedKey: "payload",
});

const withHooks = bingo-logger({
    hooks: {
        logMethod(args, method, level) {
            return method.apply(this, ['msg', ...args]);
        },
    },
});

// Properties/types imported from bingo-logger-std-serializers
const wrappedErrSerializer = bingo-logger.stdSerializers.wrapErrorSerializer((err: bingo-logger.SerializedError) => {
    return { ...err, newProp: "foo" };
});
const wrappedReqSerializer = bingo-logger.stdSerializers.wrapRequestSerializer((req: bingo-logger.SerializedRequest) => {
    return { ...req, newProp: "foo" };
});
const wrappedResSerializer = bingo-logger.stdSerializers.wrapResponseSerializer((res: bingo-logger.SerializedResponse) => {
    return { ...res, newProp: "foo" };
});

const socket = new Socket();
const incomingMessage = new IncomingMessage(socket);
const serverResponse = new ServerResponse(incomingMessage);

const mappedHttpRequest: { req: bingo-logger.SerializedRequest } = bingo-logger.stdSerializers.mapHttpRequest(incomingMessage);
const mappedHttpResponse: { res: bingo-logger.SerializedResponse } = bingo-logger.stdSerializers.mapHttpResponse(serverResponse);

const serializedErr: bingo-logger.SerializedError = bingo-logger.stdSerializers.err(new Error());
const serializedReq: bingo-logger.SerializedRequest = bingo-logger.stdSerializers.req(incomingMessage);
const serializedRes: bingo-logger.SerializedResponse = bingo-logger.stdSerializers.res(serverResponse);

/**
 * Destination static method
 */
const destinationViaDefaultArgs = bingo-logger.destination();
const destinationViaStrFileDescriptor = bingo-logger.destination("/log/path");
const destinationViaNumFileDescriptor = bingo-logger.destination(2);
const destinationViaStream = bingo-logger.destination(process.stdout);
const destinationViaOptionsObject = bingo-logger.destination({ dest: "/log/path", sync: false });

bingo-logger(destinationViaDefaultArgs);
bingo-logger({ name: "my-logger" }, destinationViaDefaultArgs);
bingo-logger(destinationViaStrFileDescriptor);
bingo-logger({ name: "my-logger" }, destinationViaStrFileDescriptor);
bingo-logger(destinationViaNumFileDescriptor);
bingo-logger({ name: "my-logger" }, destinationViaNumFileDescriptor);
bingo-logger(destinationViaStream);
bingo-logger({ name: "my-logger" }, destinationViaStream);
bingo-logger(destinationViaOptionsObject);
bingo-logger({ name: "my-logger" }, destinationViaOptionsObject);

try {
    throw new Error('Some error')
} catch (err) {
    log.error(err)
}

interface StrictShape {
    activity: string;
    err?: unknown;
}

info<StrictShape>({
    activity: "Required property",
});

const logLine: bingo-logger.LogDescriptor = {
    level: 20,
    msg: "A log message",
    time: new Date().getTime(),
    aCustomProperty: true,
};

interface CustomLogger extends bingo-logger.Logger {
    customMethod(msg: string, ...args: unknown[]): void;
}

const serializerFunc: bingo-logger.SerializerFn = () => {}
const writeFunc: bingo-logger.WriteFn = () => {}

interface CustomBaseLogger extends bingo-logger.BaseLogger {
  child(): CustomBaseLogger
}

const customBaseLogger: CustomBaseLogger = {
  level: 'info',
  fatal() {},
  error() {},
  warn() {},
  info() {},
  debug() {},
  trace() {},
  silent() {},
  child() { return this }
}

// custom levels
const log3 = bingo-logger({ customLevels: { myLevel: 100 } })
expectError(log3.log())
log3.level = 'myLevel'
log3.myLevel('')
log3.child({}).myLevel('')

const clog3 = log3.child({}, { customLevels: { childLevel: 120 } })
// child inherit parant
clog3.myLevel('')
// child itself
clog3.childLevel('')
const cclog3 = clog3.child({}, { customLevels: { childLevel2: 130 } })
// child inherit root
cclog3.myLevel('')
// child inherit parant
cclog3.childLevel('')
// child itself
cclog3.childLevel2('')
