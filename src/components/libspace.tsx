import { vec, Vec2d } from "./libvec"
import { render } from "./librender"
import { colors } from "./libcolors"
import { input } from "./libinput"
import { m } from "./libm"

export enum Shape {
    Triangle,
    Block,
    Ellipse,
    Asteroid,
    Ship,
}

export type SpaceObject = {
    shape: Shape
    mass: number
    size: Vec2d
    color: string
    position: Vec2d
    velocity: Vec2d
    acceleration: Vec2d
    angleDegree: number
    name: string
    health: number
    killCount: number
    fuel: number
    enginePower: number
    steeringPower: number
    ammo: number
    shotsInFlight: SpaceObject[]
    missileSpeed: number
    missileDamage: number
    canonCoolDown: number
    canonOverHeat: boolean
    canonHeatAddedPerShot: number
    canonCoolDownSpeed: number
    shieldPower: number
    colliding: boolean
    collidingWith: SpaceObject[]
    damage: number
    armedDelay: number
    bounceCount: number
    didHit: boolean
    shotBlowFrame: number
    afterBurnerEnabled: boolean
}

function wrapSpaceObject(so: SpaceObject, screen: Vec2d) {
    vec.wrap(so.position, screen)
}

function heading(so: SpaceObject): Vec2d {
    return {
        x: Math.cos(m.degToRad(so.angleDegree)),
        y: Math.sin(m.degToRad(so.angleDegree)),
    }
}

function alignHeadingToVelocity(so: SpaceObject) {
    so.angleDegree = m.radToDeg(Math.atan2(so.velocity.y, so.velocity.x))
}

function isColliding(so0: SpaceObject, so1: SpaceObject): boolean {
    if (
        so0.position.x < so1.position.x + so1.size.x &&
        so0.position.x + so0.size.x > so1.position.x &&
        so0.position.y < so1.position.y + so1.size.y &&
        so0.position.y + so0.size.y > so1.position.y
    ) {
        return true
    }
    return false
}

function bounceSpaceObject(
    so: SpaceObject,
    screen: Vec2d,
    energyFactor: number = 1,
    gap: number = 1,
    damageDeltaFactor: number
): boolean {
    if (so.position.x < gap) {
        so.velocity.x = -so.velocity.x * energyFactor
        so.position.x = gap
        so.bounceCount++
        so.damage = so.damage * damageDeltaFactor
        return true;
    }
    if (so.position.x >= screen.x) {
        so.velocity.x = -so.velocity.x * energyFactor
        so.position.x = screen.x - gap
        so.bounceCount++
        so.damage = so.damage * damageDeltaFactor
        return true;

    }
    if (so.position.y < gap) {
        so.velocity.y = -so.velocity.y * energyFactor
        so.position.y = gap
        so.bounceCount++
        so.damage = so.damage * damageDeltaFactor
        return true;

    }
    if (so.position.y >= screen.y) {
        so.velocity.y = -so.velocity.y * energyFactor
        so.position.y = screen.y - gap
        so.bounceCount++
        so.damage = so.damage * damageDeltaFactor
        return true;

    }

    return false;
}

function gravity(so1: SpaceObject, so2: SpaceObject, G: number, mul: number) {
    const m1: number = so1.mass
    const m2: number = so2.mass
    const r: number = vec.magnitude(vec.sub(so1.position, so2.position))
    const r2: number = Math.pow(r, 2)
    const F: number = G * ((m1 * m2) / r2)

}

function friction(so: SpaceObject, friction: number) {
    vec.scalarMultiply(so.velocity, friction)
}

function createDefaultSpaceObject(): SpaceObject {
    let maxSpeed = 1.5
    let so: SpaceObject = {
        shape: Shape.Triangle,
        mass: 1,
        size: { x: 24, y: 24 },
        color: "#fff",
        position: { x: m.rndi(0, 1000), y: m.rndi(0, 900) },
        velocity: { x: m.rndf(-maxSpeed, maxSpeed), y: m.rndf(-maxSpeed, maxSpeed) },
        acceleration: { x: 0, y: 0 },
        name: "SpaceObject",
        angleDegree: 0,
        health: 100,
        killCount: 0,
        fuel: 500,
        enginePower: 0.25,
        steeringPower: 2.5,
        ammo: 10,
        shotsInFlight: [],
        missileSpeed: 5, // 30
        missileDamage: 10,
        canonCoolDown: 0,
        canonOverHeat: false,
        canonHeatAddedPerShot: 25,
        canonCoolDownSpeed: 8,
        shieldPower: 100,
        colliding: false,
        collidingWith: [],
        damage: 5,
        armedDelay: 1,
        bounceCount: 0,
        didHit: false,
        shotBlowFrame: 16,
        afterBurnerEnabled: false
    }

    return so
}

function decayDeadSpaceObjects(so: SpaceObject[]): SpaceObject[] {
    let out = so.filter(function (e) {
        return e.health > 0
    })
    return out
}

function decayOffScreenShots(so: SpaceObject, screen: Vec2d) {
    so.shotsInFlight = so.shotsInFlight.filter(function (e) {
        return !vec.offScreen(e.position, screen)
    })
}



function decayDeadShots(so: SpaceObject) {
    so.shotsInFlight = decayDeadSpaceObjects(so.shotsInFlight)
}

function removeShotsAfterBounces(so: SpaceObject, maxBounces: number) {
    so.shotsInFlight = so.shotsInFlight.filter(function (e) {
        return e.bounceCount <= maxBounces
    })
}

function applySteer(so: SpaceObject): number {
    return so.steeringPower
}

function spaceObjectKeyController(so: SpaceObject) {
    so.afterBurnerEnabled = false
    if (input.upPressed) {
        so.afterBurnerEnabled = true
        let angleRadians: number = (so.angleDegree * Math.PI) / 180
        let engine = applyEngine(so)
        vec.add(so.velocity, {
            x: engine * Math.cos(angleRadians),
            y: engine * Math.sin(angleRadians),
        })
    }

    if (input.downPressed) {
        let angleRadians: number = (so.angleDegree * Math.PI) / 180
        let engine = applyEngine(so)
        vec.add(so.velocity, {
            x: -engine * Math.cos(angleRadians),
            y: -engine * Math.sin(angleRadians),
        })
    }

    if (input.leftStrafePressed) {
        let angleRadians: number = ((so.angleDegree - 90) * Math.PI) / 180
        let engine = applyEngine(so)
        vec.add(so.velocity, {
            x: engine * Math.cos(angleRadians),
            y: engine * Math.sin(angleRadians),
        })
    }

    if (input.rightStrafePressed) {
        let angleRadians: number = ((so.angleDegree + 90) * Math.PI) / 180
        let engine = applyEngine(so)
        vec.add(so.velocity, {
            x: engine * Math.cos(angleRadians),
            y: engine * Math.sin(angleRadians),
        })
    }

    if (input.leftPressed) {
        so.angleDegree -= applySteer(so)
    }

    if (input.rightPressed) {
        so.angleDegree += applySteer(so)
    }

    if (input.spacePressed) {
        fire(so)
    }
}



function coolDown(so: SpaceObject) {

    if (so.canonCoolDown >= 100) {
        so.canonOverHeat = true
    }

    so.canonCoolDown -= so.canonCoolDownSpeed
    if (so.canonCoolDown < 1) {
        so.canonCoolDown = 0
        so.canonOverHeat = false
    }
}

function handleCollisions(spaceObjects: SpaceObject[], ctx: any) {
    const vibration: number = 0
    for (let so0 of spaceObjects) {
        for (let so1 of spaceObjects) {
            if (space.isColliding(so0, so1) && so0.name !== so1.name) {
                so0.colliding = true
                so1.colliding = true
                so0.collidingWith.push(so1)
                so1.collidingWith.push(so0)
                so0.health -= 25
                so1.health -= 25
                render.explosionFrame(so0.position, ctx)
                render.explosionFrame(so1.position, ctx)
            }
            for (let shot of so0.shotsInFlight) {
                if (shot.armedDelay < 0) {
                    if (space.isColliding(shot, so0) && shot.didHit === false) {
                        so0.health -= shot.damage
                        so0.position = vec.add(so0.position, { x: m.rndi(-vibration, vibration), y: m.rndi(-vibration, vibration) })
                        so0.angleDegree = so0.angleDegree + m.rndi(-vibration, vibration)
                        shot.didHit = true
                    }
                    if (space.isColliding(shot, so1) && shot.didHit === false) {
                        so1.health -= shot.damage
                        so1.position = vec.add(so1.position, { x: m.rndi(-vibration, vibration), y: m.rndi(-vibration, vibration) })
                        so1.angleDegree = so0.angleDegree + m.rndi(-vibration, vibration)
                        shot.didHit = true
                    }
                }
            }
        }
    }
}

function handleHittingShot(shot: SpaceObject, ctx: any) {
    if (shot.didHit) {
        shot.shotBlowFrame--
        shot.velocity = vec.scalarMultiply(shot.velocity, -0.8)
        render.explosionFrame(shot.position, ctx)
        if (shot.shotBlowFrame < 0) {
            shot.health = 0
        }
    }
}


function updateSpaceObject(so: SpaceObject, screen: Vec2d, ctx: any) {
    vec.add(so.position, so.velocity)
    vec.add(so.velocity, so.acceleration)
    coolDown(so)
    for (let shot of so.shotsInFlight) {
        vec.add(shot.position, shot.velocity)
        vec.add(shot.velocity, shot.acceleration)
        shot.armedDelay--
        bounceSpaceObject(shot, screen, 1, 0, 0.7)
        alignHeadingToVelocity(shot)
        handleHittingShot(shot, ctx)
    }
    // decayShots(so, screen)
    decayDeadShots(so)
    removeShotsAfterBounces(so, 2)
}



function resetCollisions(spaceObjects: SpaceObject[]) {
    for (let so of spaceObjects) {
        so.colliding = false
        so.collidingWith = []
    }
}

function fire(so: SpaceObject) {
    if (so.ammo < 1) {
        console.log(so.name + ' is out of ammo')
        return
    }
    if (so.canonOverHeat) {
        return
    }
    so.canonCoolDown += so.canonHeatAddedPerShot
    so.ammo--
    let shot = createDefaultSpaceObject()
    shot.damage = so.missileDamage
    shot.size = { x: m.rndi(2, 3), y: m.rndi(30, 45) }
    shot.color = colors.randomGreen()
    let head: Vec2d = vec.copy(so.position)
    const aimError = 8
    const headError = 0.019
    const speedError = 1.8
    head = vec.add(head, vec.scalarMultiply(heading(so), 15))
    head = vec.add(head, {
        x: m.rndi(-aimError, aimError),
        y: m.rndi(-aimError, aimError),
    })
    shot.velocity = vec.scalarMultiply(
        heading(so),
        so.missileSpeed + m.rndf(0, speedError)
    )
    vec.add(shot.velocity, {
        x: m.rndf(-headError, headError),
        y: m.rndf(-headError, headError),
    })
    shot.position = head
    shot.angleDegree = so.angleDegree
    so.shotsInFlight.push(shot)
}

function applyEngine(so: SpaceObject): number {
    if (so.fuel > 0) {
        so.fuel -= so.enginePower
        return so.enginePower
    }
    so.fuel = 0
    console.log(so.name + " has no more fuel!", so)
    return 0
}

export const space = {
    createDefaultSpaceObject: createDefaultSpaceObject,
    alignHeadingToVelocity: alignHeadingToVelocity,
    bounceSpaceObject: bounceSpaceObject,
    wrapSpaceObject: wrapSpaceObject,
    isColliding: isColliding,
    applyEngine: applyEngine,
    friction: friction,
    heading: heading,
    gravity: gravity,
    decayDeadShots: decayDeadShots,
    applySteer: applySteer,
    decayDeadSpaceObjects: decayDeadSpaceObjects,
    decayOffScreenShots: decayOffScreenShots,
    removeShotsAfterBounces: removeShotsAfterBounces,
    spaceObjectKeyController: spaceObjectKeyController,
    coolDown: coolDown,
    handleCollisions: handleCollisions,
    handleHittingShot: handleHittingShot,
    updateSpaceObject: updateSpaceObject,
    resetCollisions: resetCollisions,
    fire: fire,
}
