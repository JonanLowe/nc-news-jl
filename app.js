const express = require("express");
const app = express();
const endpoints = require("./endpoints.json")

const { getTopics, getApi } = require("./controllers/topics-controllers");

app.get("/api/topics", getTopics);
app.get("/api", (request, response) => {
    response.status(200).send({ endpoints })
});




app.all("/*", (request, response) => {
  response.status(404).send({ msg: "Not Found" });
});

app.use((err, request, response) => {
  console.log("reached 500 server error");
  response.status(500).send({ msg: "Internal Server Error" });
});

module.exports = app;
