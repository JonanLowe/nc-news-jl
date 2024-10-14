const express = require("express");
const app = express();
const endpoints = require("./endpoints.json");

const { getTopics } = require("./controllers/topics-controllers");
const { getArticleById } = require("./controllers/articles-controllers");

app.get("/api/topics", getTopics);
app.get("/api", (request, response) => {
  response.status(200).send({ endpoints });
});
app.get("/api/articles/:article_id", getArticleById);

app.all("/*", (request, response) => {
  response.status(404).send({ msg: "Not Found" });
});

app.use((err, request, response, next) => {
  if (err.code === "22P02") {
    response.status(400).send({ msg: "Bad request" });
  } else {
    next(err);
  }
});

app.use((err, request, response, next) => {
  if (err.status && err.msg) {
    response.status(err.status).send({ msg: err.msg });
  } else {
    next(err);
  }
});

app.use((err, request, response) => {
  response.status(500).send({ msg: "Internal Server Error" });
});

module.exports = app;
