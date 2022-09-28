const e = require("express")
const express = require("express")
const path = require("path")
const app = express()

const ws = require("ws")
const PORT = 5678
const wss = new ws.WebSocketServer({
  port: PORT,
})
const app_version = require("../package.json").version
const app_name = require("../package.json").name
const server_name = app_name + "_server_" + app_version
const host_version = process.version
console.log(server_name + " running on node " + host_version)

// some connected user did send a message. DateTime, UserID, message.
// clients are a user with a UserID. OnMessageSent the client send a ws packet with messageData
let connectedUsers = []

function getListOfConnectedUsers() {
  let users = []
  for (let user of connectedUsers) {
    users.push({
      joinedDate: user.joinedDate,
      name: user.name,
    })
  }
  return users
}

let nextUserId = 0

function getLowestAvailableCid() {
  nextUserId++
  return nextUserId
}

let nextServerUserId = 0

function getLowestAvailableServerCid() {
  nextServerUserId++
  return nextServerUserId
}

let broadcastedMessagesList = []

function broadcastMessage(message, cidToSkip = -1) {
  if (!message.newReaction) {
    broadcastedMessagesList.push(message)
  }

  if (connectedUsers.length < 1) {
    console.log("No users connected")
  }
  for (let user of connectedUsers) {
    if (cidToSkip !== user.cid) {
      console.log(
        "Broadcasting " +
          message.user +
          ": " +
          message.text +
          " to " +
          user.name
      )
      user.sock.send(JSON.stringify(message))
    } else {
      console.log("Skips to broadcast " + message.message + " to " + user.name)
    }
  }
  console.log("Number of connected users: " + connectedUsers.length)
}

function removeUser(scid) {
  if (scid === false) {
    console.error('CANNOT REMOVE USER "FALSE"')
    return
  }
  connectedUsers = connectedUsers.filter((user) => {
    return user.scid !== scid
  })
}

function sendWelcomeMessage(ws, scid) {
  ws.send(
    JSON.stringify({
      systemMessage: true,
      rxDate: new Date(),
      text: "Welcome back ",
      user: server_name,
      srvAck: true,
      initMessage: true,
      scid: scid,
      messageHistory: broadcastedMessagesList,
    })
  )
}

const textColor = {
  1: "#FF0000", //Red
  2: "#008000", //Green
  3: "#0000FF", //Blue
  4: "#800080", //Purple
  5: "#FFFF00", //Yellow
}

const colorPicker = () => {
  const number = Math.floor(Math.random() * 5) + 1
  return number
}

function sendCidRequestMessage(ws, cid, scid) {
  ws.send(
    JSON.stringify({
      systemMessage: true,
      rxDate: new Date(),
      cidResponse: true,
      cidOption: cid,
      server: server_name,
      text: "Welcome! You got the name: Player " + cid,
      scid: scid,
      user: server_name,
      srvAck: true,
      color: textColor[colorPicker],
      messageHistory: broadcastedMessagesList,
    })
  )
}

function addUser(cid, socket, scid) {
  connectedUsers.forEach((c) => {
    if (cid === c) {
      console.error("CID ALREADY EXISTS: " + c)
    }
  })
  connectedUsers.push({
    systemMessage: true,
    joinedDate: new Date(),
    name: "User#" + cid,
    cid: cid,
    sock: socket,
    scid: scid,
  })

  broadcastMessage(
    {
      systemMessage: true,
      rxDate: new Date(),
      srvAck: true,
      user: "Player #" + cid,
      text: "<joined the chat>",
      userJoined: true,
      cid: cid,
      scid: scid,
    },
    cid
  )
}

const handleReaction = (message) => {
  //foundMessage håller alla gamla reactions
  //message håller i det nya reactions
  //om message har ett cid som finns i foundmessage -> skriv över reactions från foundmessage till message
  //och uppdatera den gamla reaktion med nya emoji

  //keeps all old reactions
  const foundMessage = broadcastedMessagesList.find(
    (old) => old.srvAckMid === message.srvAckMid
  )

  //new reaction
  const newReaction = message.reactions[message.reactions.length - 1]

  newReaction.srvAck = true

  const foundOldReaction = foundMessage.reactions.find(
    (old) => old.cid === newReaction.cid
  )

  if (foundOldReaction) {
    message.reactions = foundMessage.reactions
    const newReactionSameCid = message.reactions.find(
      (reaction) => reaction.cid === newReaction.cid
    )

    newReactionSameCid.emoji = newReaction.emoji
    newReactionSameCid.srvAck = true
  }

  foundMessage.reactions = message.reactions
  broadcastMessage(message)
}

const sendUsers = (cid, scid) => {
  broadcastMessage({
    requestedOnlineUsers: true,
    onlineUsers: getListOfConnectedUsers(),
    systemMessage: true,
    rxDate: new Date(),
    srvAck: true,
    user: "",
    text: "Amount of users changed",
    userLeft: true,
    cid: cid,
    scid: scid,
  })
}

const getMessageLength = () => {
  let systemMessages = 0
  let chatMessages = 0

  broadcastedMessagesList.forEach((message) => {
    if (message.systemMessage) {
      systemMessages++
    } else chatMessages++
  })

  return {
    systemMessages: systemMessages,
    chatMessages: chatMessages,
  }
}

function init() {
  wss.on("connection", function connection(ws) {
    let cid = false
    const scid = getLowestAvailableServerCid()

    ws.on("message", function message(data) {
      let parsedObject = JSON.parse(data)

      if (parsedObject.chatCommand) {
        const firstChar = parsedObject.text.charAt(0)
        console.log(firstChar)
        console.log(parsedObject.text)

        if (parsedObject.text === "/clear") {
          console.log("Clears message log")
          cid = parsedObject.cid
          parsedObject.systemMessage = true
          parsedObject.rxDate = new Date()
          parsedObject.srvAckMid = parsedObject.mid
          parsedObject.srvAck = true
          parsedObject.text = " - Cleared chat"
          parsedObject.clearChat = true
          broadcastMessage(parsedObject)
          broadcastedMessagesList = []
          broadcastedMessagesList.push(parsedObject)
          return
        }
        if (parsedObject.text === "/users") {
          const users = getListOfConnectedUsers()
          console.log("Write out online users")
          cid = parsedObject.cid
          parsedObject.systemMessage = true
          parsedObject.rxDate = new Date()
          parsedObject.srvAckMid = parsedObject.mid
          parsedObject.srvAck = true
          parsedObject.text =
            " - Users: " + users.map((user) => " " + user.name)
          broadcastMessage(parsedObject)

          return
        }

        if (parsedObject.text === "/len") {
          const messageLength = getMessageLength()
          console.log("cmd len")
          cid = parsedObject.cid
          parsedObject.systemMessage = true
          parsedObject.rxDate = new Date()
          parsedObject.srvAckMid = parsedObject.mid
          parsedObject.srvAck = true
          parsedObject.text =
            " - Chat messages: " +
            messageLength.chatMessages +
            " - System messages: " +
            messageLength.systemMessages +
            "\n"

          broadcastMessage(parsedObject)
          return
        }

        if (parsedObject.text === "/help") {
          console.log("cmd help")
          cid = parsedObject.cid
          parsedObject.systemMessage = true
          parsedObject.rxDate = new Date()
          parsedObject.srvAckMid = parsedObject.mid
          parsedObject.srvAck = true
          parsedObject.text = " - Available Commands: /help /clear /len"
          broadcastMessage(parsedObject)
          return
        } else console.log("Command not found")
        cid = parsedObject.cid
        parsedObject.systemMessage = true
        parsedObject.rxDate = new Date()
        parsedObject.srvAckMid = parsedObject.mid
        parsedObject.srvAck = true
        parsedObject.text =
          " - Chat command not found. Write /help to see available commands"
        broadcastMessage(parsedObject)
        return
      }

      if (parsedObject.newReaction) {
        handleReaction(parsedObject)
        return
      }
      if (parsedObject.clientInit === true) {
        cid = getLowestAvailableCid()
        sendCidRequestMessage(ws, cid, scid)
        addUser(cid, ws, scid)
        sendUsers(cid, scid)
      } else if (parsedObject.haveCookieCid) {
        cid = parsedObject.cid
        console.log("Add user with existing cid " + parsedObject.cid)
        addUser(parsedObject.cid, ws, scid)
        sendUsers(cid, scid)
      } else {
        cid = parsedObject.cid
        parsedObject.rxDate = new Date()
        parsedObject.srvAckMid = parsedObject.mid
        parsedObject.srvAck = true
        //parsedObject.user = "Player #" + parsedObject.cid
        broadcastMessage(parsedObject)
        sendUsers(cid, scid)
      }
    })

    ws.addEventListener("close", (event) => {
      broadcastMessage({
        systemMessage: true,
        rxDate: new Date(),
        srvAck: true,
        user: "Player #" + cid,
        text: "<Logged out>",
        userLeft: true,
        cid: cid,
        scid: scid,
      })
      removeUser(scid)
      console.log("User scid:" + scid + " left the chat")
      console.log({ connectedUsers })
      broadcastMessage({
        requestedOnlineUsers: true,
        onlineUsers: getListOfConnectedUsers(),
        systemMessage: true,
        rxDate: new Date(),
        srvAck: true,
        user: "",
        text: "Amount of users changed",
        userLeft: true,
        cid: cid,
        scid: scid,
      })
    })

    sendWelcomeMessage(ws)
  })

  console.log("server initialized")
}

init()

app.use(express.static(path.join(__dirname, "../build")))

app.get("/", function (req, res) {
  res.sendFile(path.join(__dirname, "../build", "index.html"))
})

app.get("/version", (req, res) => {
  res.send(server_name)
})

app.listen(80)
console.log("Listening on port 80...")
