
let upPressed: boolean = false
let downPressed: boolean = false
let rightPressed: boolean = false
let rightStrafePressed = false
let leftStrafePressed = false
let leftPressed: boolean = false
let spacePressed: boolean = false
let bounce: boolean = true

function arrowControl(e: any, value: boolean) {
  if (e.key === "ArrowUp") {
    upPressed = value
  }
  if (e.key === "w") {
    upPressed = value
  }
  if (e.key === "ArrowDown") {
    downPressed = value
  }
  if (e.key === "s") {
    downPressed = value
  }
  if (e.key === "ArrowLeft") {
    leftPressed = value
  }
  if (e.key === "ArrowRight") {
    rightPressed = value
  }
  if (e.key === "a") {
    leftStrafePressed = value
  }
  if (e.key === "d") {
    rightStrafePressed = value
  }
  // wtf code?..
  if (e.code === "Space") {
    spacePressed = value
  }
  if (e.key === "b" && value) {
    bounce = !bounce
    console.log({ bounce })
  }
}

export const input = {
  arrowControl: arrowControl,
  upPressed: upPressed,
  downPressed: downPressed,
  leftPressed: leftPressed,
  rightPressed: rightPressed,
  leftStrafePressed: leftStrafePressed,
  rightStrafePressed: rightStrafePressed,
  spacePressed: spacePressed,
}

