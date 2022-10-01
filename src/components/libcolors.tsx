
function randomColor(r: string, g: string, b: string): string {
    return (
        "#" +
        r[Math.floor(Math.random() * r.length)] +
        g[Math.floor(Math.random() * g.length)] +
        b[Math.floor(Math.random() * b.length)]
    )
}

function randomGreen(): string {
    const r = "012345"
    const g = "6789ABCDEF"
    const b = "012345"
    return randomColor(r, g, b)
}

function randomBlue(): string {
    const r = "012345"
    const g = "012345"
    const b = "6789ABCDEF"
    return randomColor(r, g, b)
}

function randomRed(): string {
    const r = "6789ABCDEF"
    const g = "012345"
    const b = "012345"
    return randomColor(r, g, b)
}

function randomAnyColor(): string {
    const r = "0123456789ABCDEF"
    const g = "0123456789ABCDEF"
    const b = "0123456789ABCDEF"
    return randomColor(r, g, b)
}

export const colors = {
    randomColor: randomColor,
    randomGreen: randomGreen,
    randomBlue: randomBlue,
    randomRed: randomRed,
    randomAnyColor: randomAnyColor,
}
