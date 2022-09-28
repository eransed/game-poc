
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
    console.log (color2(`${getDt()} `, BLU, bg(BLK)) + " " + str)
}

module.exports.log = log
module.exports.error = error
module.exports.warn = warn
module.exports.fatal = fatal
