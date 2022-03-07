require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const { NodeSSH } = require("node-ssh");
const fs = require("fs");
const path = require("path");
const ssh = new NodeSSH();
const app = express();
const port = 4000;

app.use(bodyParser.urlencoded({ extended: false }));

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/static/index.html");
});

const queue = [];

app.post("/", (req, res) => {
  // Insert Login Code Here
  let message = req.body.message;

  queue.push(message);

  res.sendFile(__dirname + "/static/index.html");

  while (queue.length > 1) {
    queue.shift();

    console.log("queue: ", queue);

    ssh
      .connect({
        host: process.env.HOST,
        username: process.env.USERNAME,
        password: process.env.PASSWORD,
      })
      .then(function () {
        // Command
        ssh
          .execCommand(
            "sudo python runtext2.py --led-cols=32 --led-rows=16 --led-chain=2 --text " +
              queue[0],
            { cwd: "/home/pi/rpi-rgb-led-matrix/bindings/python/samples" }
          )
          .then(function (result) {
            console.log("THIS IS FINISHED!!!");
            console.log("STDOUT: " + result.stdout);
            console.log("STDERR: " + result.stderr);
          });
      });
  }
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
