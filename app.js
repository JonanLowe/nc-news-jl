const express = require("express");
const app = express();

const { getTopics } = require("./controllers/topics-controllers");

app.get("/api/topics", getTopics);

app.all("/*", (request, response) => {
  response.status(404).send({ msg: "Not Found" });
});

app.use((err, request, response, next) => {
  console.log("reached 500 server error");
  response.status(500).send({ msg: "Internal Server Error" });
});

module.exports = app;
