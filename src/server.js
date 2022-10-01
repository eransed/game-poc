
const c = require('./logger')
const express = require("express")
const path = require("path")
const app = express()
const ws = require("ws")
const PORT = 5678
const wss = new ws.WebSocketServer({port: PORT})
const app_version = require("../package.json").version
const app_name = require("../package.json").name
const server_name = app_name + "_server_" + app_version
const host_version = process.version

c.log(server_name + " running on node " + host_version)

app.use(express.static(path.join(__dirname, "../build")))

app.get("/", function (req, res) {
//   res.sendFile(path.join(__dirname, "../build", "index.html"))
    res.send("work in progress")
    c.warn(req.ip + " requested /")

})

app.get("/version", (req, res) => {
  res.send(server_name)
  c.log(req.ip + " requested /version")
})

app.listen(80)

function test1 () {
  c.log("test1: Listening on port 80...")
}


let test2 = () => {
  c.log("test2: Listening on port 80...")
  c.log2("test2: log 2")
}

test1()
test2()
