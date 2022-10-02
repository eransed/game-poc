
import { m } from "./libm"

export type Vec2d = {
    x: number
    y: number
}

// refactor all vector ops to only return results and not change the arguments
function add(to: Vec2d, from: Vec2d): Vec2d {
    to.x += from.x
    to.y += from.y
    return to
}

function addc(to: Vec2d, from: Vec2d): Vec2d {
    let tmp = copy(to)
    tmp.x += from.x
    tmp.y += from.y
    return tmp
}

function sub(to: Vec2d, from: Vec2d): Vec2d {
    let tmp = copy(to)
    tmp.x -= from.x
    tmp.y -= from.y
    return tmp
}

function copy_(to: Vec2d, from: Vec2d): Vec2d {
    to.x = from.x
    to.y = from.y
    return to
}

function copy(from: Vec2d): Vec2d {
    let to: Vec2d = { x: 0, y: 0 }
    to.x = from.x
    to.y = from.y
    return to
}

function copy2(from: Vec2d): Vec2d {
    return { x: from.x, y: from.y }
}


function rndiVec(xyrnd: number): Vec2d {
    return { x: m.rndi(0, xyrnd), y: m.rndi(0, xyrnd) }
}

function rndiVec_mm(min: number, max: number): Vec2d {
    return { x: m.rndi(min, max), y: m.rndi(min, max) }
}

function rndfVec(xyrnd: number): Vec2d {
    return { x: m.rndf(0, xyrnd), y: m.rndf(0, xyrnd) }
}

function rndfVec_mm(min: number, max: number): Vec2d {
    return { x: m.rndf(min, max), y: m.rndf(min, max) }
}

function to_string(v: Vec2d): string {
    return "(" + m.round2dec(v.x, 0) + ", " + m.round2dec(v.y, 0) + ")"
}

function scalarMultiply(v: Vec2d, s: number): Vec2d {
    v.x *= s
    v.y *= s
    return v
}

function round(v: Vec2d, decimals: number): Vec2d {
    let tmp = copy2(v)
    tmp.x = m.round2dec(tmp.x, decimals)
    tmp.y = m.round2dec(tmp.y, decimals)
    return tmp
}

function floor(v: Vec2d): Vec2d {
    return { x: Math.floor(v.x), y: Math.floor(v.x) }
}

function magnitude(v: Vec2d): number {
    return Math.sqrt(Math.pow(v.x, 2) + Math.pow(v.y, 2))
}

function wrap(p: Vec2d, screen: Vec2d) {
    if (p.x < 0) {
        p.x = screen.x
    }
    if (p.x > screen.x) {
        p.x = 0
    }
    if (p.y < 0) {
        p.y = screen.y
    }
    if (p.y > screen.y) {
        p.y = 0
    }
}

function headingFromAngle(angleDegree: number): Vec2d {
    return {
        x: Math.cos(m.degToRad(angleDegree)),
        y: Math.sin(m.degToRad(angleDegree)),
    }
}

function offScreen(v: Vec2d, screen: Vec2d) {
    if (v.x > screen.x) return true
    if (v.x < 0) return true
    if (v.y > screen.y) return true
    if (v.y < 0) return true
    return false
}

function lowerLeft(screen: Vec2d, padding: number) {
    return { x: padding, y: screen.y - padding }
}

function lowerRight(screen: Vec2d, padding: number) {
    return { x: screen.x - padding, y: screen.y - padding }
}

function upperLeft(screen: Vec2d, padding: number) {
    return { x: padding, y: padding }
}

function upperRight(screen: Vec2d, padding: number) {
    return { x: screen.x - padding, y: padding }
}

function center(screen: Vec2d) {
    return { x: screen.x / 2, y: screen.y / 2 }
}

function getScreenVecFromCanvasContext(ctx: any) {
    const screen: Vec2d = { x: ctx.canvas.width, y: ctx.canvas.height }
    return screen
}

export const vec = {
    offScreen: offScreen,
    headingFromAngle: headingFromAngle,
    wrap: wrap,
    magnitude: magnitude,
    round: round,
    scalarMultiply: scalarMultiply,
    to_string: to_string,
    add: add,
    sub: sub,
    addc: addc,
    copy: copy,
    copy_: copy_,
    copy2: copy2,
    rndiVec: rndiVec,
    rndfVec: rndfVec,
    rndfVec_mm: rndfVec_mm,
    rndiVec_mm: rndiVec_mm,
    floor: floor,
    getScreenVecFromCanvasContext: getScreenVecFromCanvasContext,
    lowerLeft: lowerLeft,
    lowerRight: lowerRight,
    upperLeft: upperLeft,
    upperRight: upperRight,
    center: center,
}
