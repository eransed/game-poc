import React from "react"
import "./App.css"

import Game2D from "./components/Game2D"

//Contexts
import { ServerProvider } from "./contexts/serverContext"

const App = () => {
  return (
    <ServerProvider>
      <Game2D />
    </ServerProvider>
  )
}

export default App
