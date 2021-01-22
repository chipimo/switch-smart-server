var express = require("express");
var app = express();
var http = require("http").Server(app);
var io = (module.exports.io = require("socket.io")(http));
var path = require("path");
var bodyParser = require("body-parser");

require("custom-env").env();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.get("/*", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

app.use(express.static(path.join(__dirname, "public")));

const SocketManager = require("./SocketManager");
io.on("connection", SocketManager);

const PORT = process.env.PORT || 3200;

http.listen(PORT, () => {
  console.log("Connected to port " + PORT);
});
