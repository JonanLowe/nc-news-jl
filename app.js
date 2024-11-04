const express = require("express");
const app = express();
const endpoints = require("./endpoints.json");
const cors = require("cors");

app.use(express.json());

app.use(cors());

const { getTopics } = require("./controllers/topics-controllers");
const {
  getArticles,
  getArticleById,
  patchVotesByArticleId,
} = require("./controllers/articles-controllers");
const {
  getCommentsByArticleId,
  postCommentByArticleId,
  deleteCommentById,
} = require("./controllers/comments-controllers");
const { getUsers } = require("./controllers/users-controllers");

app.get("/api", (request, response) => {
  response.status(200).send({ endpoints });
});

app.get("/api/topics", getTopics);
app.get("/api/articles", getArticles);
app.get("/api/articles/:article_id", getArticleById);
app.get("/api/articles/:article_id/comments", getCommentsByArticleId);
app.get("/api/users", getUsers);

app.post("/api/articles/:article_id/comments", postCommentByArticleId);

app.patch("/api/articles/:article_id", patchVotesByArticleId);

app.delete("/api/comments/:comment_id", deleteCommentById);

app.all("/*", (request, response) => {
  response.status(404).send({ msg: "Not Found" });
});

app.use((err, request, response, next) => {
  if (err.code === "22P02") {
    response.status(400).send({ msg: "Bad Request" });
  } else {
    next(err);
  }
});

app.use((err, request, response, next) => {
  if (err.code === "23503" && err.constraint.endsWith("article_id_fkey")) {
    response.status(404).send({ msg: "Article Not Found" });
  } else {
    next(err);
  }
});

app.use((err, request, response, next) => {
  if (err.code === "23503" && err.constraint.endsWith("author_fkey")) {
    response.status(400).send({ msg: "Invalid Username" });
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
  console.log("reached 500 server error");
  response.status(500).send({ msg: "Internal Server Error" });
});

module.exports = app;
