
let path = require('path');

Object.defineProperty(global, '__stack', {
get: function() {
        let orig = Error.prepareStackTrace;
        Error.prepareStackTrace = function(_, stack) {
            return stack;
        };
        let err = new Error;
        Error.captureStackTrace(err, arguments.callee);
        let stack = err.stack;
        Error.prepareStackTrace = orig;
        return stack;
    }
});

Object.defineProperty(global, '__parent_line', {
    get: function() {
            return __stack[2].getLineNumber();
        }
    });
    
Object.defineProperty(global, '__parent_function', {
get: function() {
        return __stack[2].getFunctionName();
    }
});
    
Object.defineProperty(global, '__grand_parent_line', {
get: function() {
        return __stack[3].getLineNumber();
    }
});

Object.defineProperty(global, '__grand_parent_function', {
get: function() {
        return __stack[3].getFunctionName();
    }
});

function getCallerBaseName() {
    let filename;

    let _pst = Error.prepareStackTrace
    Error.prepareStackTrace = function (err, stack) { return stack; };
    try {
        let err = new Error();
        let callerfile;
        let currentfile;

        currentfile = err.stack.shift().getFileName();

        while (err.stack.length) {
            callerfile = err.stack.shift().getFileName();

            if(currentfile !== callerfile) {
                filename = callerfile;
                break;
            }
        }
    } catch (err) {}
    Error.prepareStackTrace = _pst;

    return path.basename(filename);
}

const ESC = "\x1b[1;"
const BLK = 30
const RED = 31
const GRN = 32
const YEL = 33
const BLU = 34
const MAG = 35
const CYN = 36
const WHT = 37
const RES = 0

function bg(fg) {
    return fg + 10
}

function ansi(color) {
    return `\x1b[1;${color}m`
}

function color2(str, style1, style2) {
    return `${ansi(style2)}${ansi(style1)}${str}${ansi(RES)}`
}

function getDt() {
    const dt = new Date()
    return `${dt.toLocaleDateString()} ${dt.toLocaleTimeString()}.${String(dt.getMilliseconds()).padStart(3, '0')}`
}

function infoLog(str) {
    // let caller = arguments.callee.caller.name
    let caller = __grand_parent_function
    if (caller == null || caller.length < 1) caller = '[module]'
    const line = __grand_parent_line
    const info = `${caller}@${getCallerBaseName(3)}:${line}`
    console.log (color2(`Log ${getDt()} ${info}`, BLU, bg(BLK)) + " " + str)
}

function log2(str) {
    infoLog(str)
}

function error(str) {
    console.log(color2(`${getDt()} `, RED, bg(BLK)) + " " + str)
}

function fatal(str) {
    console.trace(color2(`${getDt()} `, WHT, bg(RED)) + " " + str)
}

function warn(str) {
    console.log (color2(`${getDt()} `, YEL, bg(BLK)) + " " + str)
}

function log(str) {
    // let caller = arguments.callee.caller.name
    let caller = __parent_function
    if (caller == null || caller.length < 1) caller = '[module]'
    const line = __parent_line
    const info = `${caller}@${getCallerBaseName()}:${line}`
    console.log (color2(`Log ${getDt()} ${info}`, BLU, bg(BLK)) + " " + str)
}

module.exports.log = log
module.exports.log2 = log2
module.exports.error = error
module.exports.warn = warn
module.exports.fatal = fatal
