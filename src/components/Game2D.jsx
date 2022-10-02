// import React from "react"
// import React, { useRef, useEffect, useContext } from "react"

//Component
import { game } from "./game"

//Contexts
// import { ServiceContext } from "../contexts/serverContext"

function Game2D(props) {
  game.init(1)
  return (
    <div style={{ textAlign: "center" }}>
      <span style={
      {
        backgroundColor: "#a22", 
        color: "#fff", 
        padding: "20px" }
      }>
      Game2D
      </span>
      <canvas
        id={props.id}
        className="Game2DCanvas"
      ></canvas>
    </div>
  )
}

export default Game2D

export const game2d = {
  start: game.start,
  setCanvas: game.getCanvas,
}
