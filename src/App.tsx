import React from "react"
import "./App.css"

import Game2D, { game2d } from "./components/Game2D"

//Contexts
import { ServerProvider } from "./contexts/serverContext"

const App = () => {

  const gameId: string = "game_1"

  return (
    <ServerProvider>
      <Game2D id={{gameId}}/>
    </ServerProvider>
  )
}

export default App
