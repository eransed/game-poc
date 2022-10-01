import { SpaceObject, Shape, space } from "./libspace"
import { vec, Vec2d } from "./libvec"
import { m } from "./libm"

function shot(so: SpaceObject, ctx: any) {
    for (let shot of so.shotsInFlight) {
        if (shot.didHit) continue
        if (Math.random() > 0.990) {
            ctx.fillStyle = (shot.armedDelay < 0 ? '#00f' : '#fff')
        } else if (Math.random() > 0.985) {
            ctx.fillStyle = (shot.armedDelay < 0 ? '#ff0' : '#fff')
        } else if (Math.random() > 0.975) {
            ctx.fillStyle = (shot.armedDelay < 0 ? '#f00' : '#fff')
        } else {
            ctx.fillStyle = (shot.armedDelay < 0 ? shot.color : '#fff')
        }
        ctx.save()
        ctx.translate(shot.position.x, shot.position.y)
        ctx.rotate(((90 + shot.angleDegree) * Math.PI) / 180)
        ctx.fillRect(-shot.size.x / 2, -shot.size.y / 2, shot.size.x, shot.size.y)
        ctx.restore()
    }
}

function explosionFrame(pos: Vec2d, ctx: any) {
    let offset: number = 7
    let minSize: number = 1
    let maxSize: number = 12
    ctx.save()
    ctx.translate(pos.x, pos.y)
    for (let c of ['#ff0', '#f00', '#ee0', '#e00', '#dd0', '#d00', '#008', '#000', '#444', '#fee', '#f66,', '#f99', '#fbb']) {
        let center = vec.add({ x: 0, y: 0 }, { x: m.rndi(-offset, offset), y: m.rndi(-offset, offset) })
        let size = vec.add({ x: 0, y: 0 }, { x: m.rndi(minSize, maxSize), y: m.rndi(minSize, maxSize) })
        ctx.fillStyle = c
        ctx.fillRect(center.x, center.y, size.x, size.y)
    }
    ctx.restore()
}

function afterBurnerFrame(pos: Vec2d, ctx: any) {
    let offset: number = 12
    let minSize: number = 4
    let maxSize: number = 9
    ctx.save()
    ctx.translate(pos.x, pos.y)
    for (let c of ['#ff0', '#00f', '#ee0', '#e00', '#ccc', '#ccc', '#aaa', '#999', '#888']) {
        let center = vec.add({ x: 0, y: 0 }, { x: m.rndi(-offset, offset), y: m.rndi(-offset, offset) })
        let size = vec.add({ x: 0, y: 0 }, { x: m.rndi(minSize, maxSize), y: m.rndi(minSize, maxSize) })
        ctx.fillStyle = c
        ctx.fillRect(center.x, center.y, size.x, size.y)
    }
    ctx.restore()
}

function ship(so: SpaceObject, ctx: any) {
    let scale: number = 2
    let shipSize = { x: 40, y: 80 }
    ctx.save()
    ctx.translate(so.position.x, so.position.y)
    ctx.fillStyle = "#fff"
    ctx.font = "22px courier"
    if (so.fuel < 250) ctx.fillStyle = "#ff0"
    if (so.fuel < 150) ctx.fillStyle = "#f00"
    let xtext: number = 200
    ctx.fillText("fuel: " + m.round2dec(so.fuel, 1), xtext, -50)
    ctx.fillStyle = "#fff"
    ctx.fillText(so.name, xtext, -200)
    ctx.fillText(vec.to_string(so.velocity), xtext, -150)
    ctx.fillText(vec.to_string(so.position), xtext, -100)
    ctx.fillText("sif: " + so.shotsInFlight.length, xtext, 0)
    ctx.fillText("ammo: " + so.ammo, xtext, 50)
    ctx.fillText("health: " + m.round2dec(so.health, 1), xtext, 100)
    ctx.fillText("heat: " + m.round2dec(so.canonCoolDown, 1), xtext, 150)
    ctx.fillText("angle: " + m.round2dec(Math.abs(so.angleDegree % 360)), xtext, 200)
    ctx.rotate((m.round2dec(90 + so.angleDegree, 1) * Math.PI) / 180)
    ctx.beginPath()
    ctx.strokeStyle = so.color
    ctx.lineWidth = 5

    // hull
    ctx.strokeStyle = so.colliding ? "#f00" : so.color
    ctx.fillStyle = so.colliding ? "#f00" : so.color
    ctx.moveTo(0, (-shipSize.y / 2) * scale)
    ctx.lineTo((-shipSize.x / 4) * scale, (shipSize.y / 4) * scale)
    ctx.lineTo((shipSize.x / 4) * scale, (shipSize.y / 4) * scale)
    ctx.lineTo(0, (-shipSize.y / 2) * scale)

    // canons
    const cannonWidth: number = 10
    const cannonStart: number = 15
    const cannonEnd: number = 40
    ctx.moveTo(cannonWidth, cannonStart)
    ctx.lineTo(cannonWidth, -cannonEnd)
    ctx.moveTo(-cannonWidth, cannonStart)
    ctx.lineTo(-cannonWidth, -cannonEnd)
    ctx.stroke()

    // tower
    ctx.beginPath()
    ctx.arc(0, 20, 16, 0, Math.PI * 2)
    ctx.fill()

    ctx.restore()
    shot(so, ctx)

    if (so.afterBurnerEnabled) {
        afterBurnerFrame(vec.addc(so.position, vec.scalarMultiply(vec.headingFromAngle(so.angleDegree - 180), 60)), ctx)
    }
}

function vector(
    v: Vec2d,
    position: Vec2d,
    scale: number = 2,
    ctx: any,
    offset: Vec2d = { x: 0, y: 0 }
) {
    ctx.save()
    ctx.translate(position.x + offset.x, position.y + offset.y)
    ctx.beginPath()
    ctx.strokeStyle = "#fff"
    ctx.lineWidth = 5
    ctx.moveTo(0, 0)
    ctx.lineTo(scale * v.x, scale * v.y)
    ctx.stroke()
    ctx.restore()
}

function watch(pos: Vec2d, size: number, ctx: any, da: number) {
    // save current state of the context
    ctx.save()
    ctx.translate(pos.x, pos.y)
    ctx.strokeStyle = '#f00'
    ctx.lineWidth = 3
    ctx.beginPath();

    const stopx: number = 0.7
    const stopy: number = 0.7
    const startx: number = 0.4
    const starty: number = 0.4
    const da2: number = 3.5 * da
    const adt: number = 30

    ctx.moveTo(startx * size * Math.cos(m.degToRad(0)), starty * size * Math.sin(m.degToRad(0)))
    for (let i = 0 - da; i < 360; i += adt) {
        ctx.moveTo(startx * size * Math.cos(m.degToRad(i)), starty * size * Math.sin(m.degToRad(i)))
        ctx.lineTo(stopx * size * Math.cos(m.degToRad(i)), stopy * size * Math.sin(m.degToRad(i)))
    }

    ctx.moveTo(size * Math.cos(m.degToRad(da2)), size * Math.sin(m.degToRad(da2)))
    ctx.arc(0, 0, size, m.degToRad(da2), (0.36 * Math.PI) + m.degToRad(da2));
    ctx.stroke()
    ctx.restore()
}

function spaceObject(so: SpaceObject, ctx: any) {
    switch (so.shape) {
        case Shape.Ship:
            ship(so, ctx)
            break
        case Shape.Asteroid:
            asteroid(so, ctx)
            break
        default:
            console.error("Unknown Shape", so.shape)
    }
}

function asteroid(so: SpaceObject, ctx: any) {
    ctx.save()
    ctx.translate(so.position.x, so.position.y)
    ctx.fillStyle = so.colliding === true ? "#f00" : so.color
    // ctx.fillRect(-so.size.x / 2, -so.size.y / 2, so.size.x, so.size.y)
    ctx.fillRect(0, 0, so.size.x, so.size.y)
    ctx.font = "22px courier"
    ctx.fillStyle = '#000'
    ctx.fillText(m.round2dec(so.health, 0), 5, 8 + (so.size.y / 2))
    ctx.restore()
}

export const render = {
    explosionFrame: explosionFrame,
    spaceObject: spaceObject,
    asteroid: asteroid,
    vector: vector,
    watch: watch,
    ship: ship,
    shot: shot,
}