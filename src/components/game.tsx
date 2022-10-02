// Framework logic: take ref to canvas 2D context.
// Render the game with a main game renderFrame function.
// Step to next animation frame with a nextFrame function

import { SpaceObject, Shape, space } from "./libspace"
import { render } from "./librender"
import { vec, Vec2d } from "./libvec"
import { input } from "./libinput"
import { m } from "./libm"

const numberOfAsteroids: number = 1
let myShip: SpaceObject = space.createDefaultSpaceObject()
let allSpaceObjects: SpaceObject[] = []
let initCalled: boolean = false

function init(cid: number, ctx: any) {
  if (initCalled === true) {
    console.log ("Init already called!")
    return;
  }
  initCalled = true;
  
  console.log("gameLib: Init")
  myShip.name = "Slayer-" + cid
  myShip.shape = Shape.Ship
  myShip.health = 9000
  myShip.fuel = 400
  myShip.ammo = 9000
  myShip.missileSpeed = 32
  myShip.missileDamage = 16
  myShip.canonHeatAddedPerShot = 100
  myShip.canonCoolDownSpeed = 50
  myShip.size = { x: 50, y: 50 }
  myShip.steeringPower = 0.88
  myShip.enginePower = 0.055
  myShip.color = '#fff'
  myShip.position = { x: 700, y: 600 }
  myShip.velocity = { x: 0.4, y: -0.6 }

  allSpaceObjects.push(myShip)

  console.log("adds event listeners")
  document.addEventListener("keydown", (event) => input.arrowControl(event, true))
  document.addEventListener("keyup", (event) => input.arrowControl(event, false))
  const edge: number = 10
  for (let i = 0; i < numberOfAsteroids; i++) {
    let a: SpaceObject = space.createDefaultSpaceObject()
    a.shape = Shape.Asteroid
    a.name = "Asteroid #" + i
    a.health = m.rndi(7000, 9999)
    a.size = vec.rndiVec_mm(60, 120)
    a.position = { x: m.rndi(edge, ctx.canvas.width - edge), y: m.rndi(edge, ctx.canvas.height - edge) }
    allSpaceObjects.push(a)
  }
  console.log(allSpaceObjects)
}

function renderFrame(ctx: any) {
  for (let so of allSpaceObjects) {
    render.spaceObject(so, ctx)
  }
  space.resetCollisions(allSpaceObjects)
  // render.watch(center(ctx), 100, ctx, da+=2)
}

const bounce: boolean = true

function nextFrame(ctx: any) {
  const screen: Vec2d = { x: ctx.canvas.width, y: ctx.canvas.height }
  // const center: Vec2d = { x: ctx.canvas.width/2, y: ctx.canvas.height/2 }

  // renderExplosionFrame(center, ctx)

  allSpaceObjects = space.decayDeadSpaceObjects(allSpaceObjects)
  space.handleCollisions(allSpaceObjects, ctx)
  space.spaceObjectKeyController(myShip)

  for (let so of allSpaceObjects) {
    if (bounce) {
      space.bounceSpaceObject(so, screen, 0.9995, 0, 1)
    } else {
      space.wrapSpaceObject(so, screen)
    }
    // friction(so, 0.992)
    space.updateSpaceObject(so, screen, ctx)

    // floor positions
    // so.position = floor(so.position)
    so.size = vec.floor(so.size)
  }
  space.friction(myShip, 0.991)
}

function renderFps(ctx: any, frameTime: number) {
  ctx.fillStyle = "#fff"
  ctx.font = "24px courier"
  ctx.fillText(
    "FPS: " + m.round2dec(1 / (frameTime / 1000), 3),
    25,
    40
  )
}

function clearScreen(ctx: any) {
  ctx.fillStyle = "#000"
  ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height)
}

let lastTime_ms: number

function renderLoop(ctx: any, renderFrameCallback: any, nextFrameCallback: any) {
  console.log("renderLoop")
  function update(time_ms: number) {
    clearScreen(ctx)
    renderFrameCallback(ctx)
    requestAnimationFrame(update)
    nextFrameCallback(ctx)
    renderFps(ctx, time_ms - lastTime_ms)
    lastTime_ms = time_ms
  }
  update(lastTime_ms)
}

let context: any

let gotCanvas: boolean = false

function getCanvas(id: string) {

  if (gotCanvas === true) {
    console.log("Canvas already added!")
    return
  }

  gotCanvas = true

  console.log ("Canvas id: " + id)

  const canvas: any = document.getElementById(id)
  const ctx = canvas.getContext("2d")
  context = ctx
  console.log ({context})

  context.canvas.width = 1600 * 1
  context.canvas.height = 900 * 1
}

let gameStarted: boolean = false

function start() {

  if (gameStarted === true) {
    console.log("Game already started!")
    return
  }

  gameStarted = true
  
  renderLoop(
    context,
    renderFrame,
    nextFrame,
  )
}

export const game = {
  init: init,
  getCanvas: getCanvas,
  start: start,
}
