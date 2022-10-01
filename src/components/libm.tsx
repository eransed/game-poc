
function rndf(min: number, max: number)
{
    return Math.random() * (max - min) + min
}

function rndi(min: number, max: number)
{
    min = Math.ceil(min)
    max = Math.floor(max)
    return Math.floor(Math.random() * (max - min + 1)) + min
}

function round2dec(num: number, dec: number = 2): number
{
    const exp = Math.pow(10, dec)
    return Math.round((num + Number.EPSILON) * exp) / exp
}

function degToRad(deg: number): number {
    return (deg * Math.PI) / 180
}

function radToDeg(rad: number): number {
    return rad * (180/Math.PI)
}

export const m = {
    rndf: rndf,
    rndi: rndi,
    round2dec: round2dec,
    degToRad: degToRad,
    radToDeg: radToDeg
}
