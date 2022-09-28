import React, { createContext, useEffect, useState } from "react"

type Props = {
  children?: JSX.Element | JSX.Element[]
}

const ServiceContext = createContext()

const ServerProvider = ({ children }: Props) => {
  const [socket, setSocket] = useState<WebSocket>()

  useEffect(() => {
    const host = new URL(window.location.href).hostname
    const socket = new WebSocket("ws://" + host + ":5678")
    setSocket(socket)
  }, [])

  return (
    <ServiceContext.Provider value={{ socket }}>
      {children}
    </ServiceContext.Provider>
  )
}

export { ServiceContext, ServerProvider }
