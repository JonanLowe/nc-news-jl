const { commentData } = require("../db/data/test-data");
const { selectArticleById } = require("../models/articles-models");
const {
  selectCommentsByArticleId,
  insertCommentByArticleId,
  removeCommentById,
} = require("../models/comments-models");

exports.getCommentsByArticleId = (request, response, next) => {
  const { article_id } = request.params;

  const promises = [
    selectCommentsByArticleId(article_id),
    selectArticleById(article_id),
  ];

  Promise.all(promises)
    .then((results) => {
      const comments = results[0];
      response.status(200).send({ comments });
    })
    .catch((err) => {
      next(err);
    });
};

exports.postCommentByArticleId = (request, response, next) => {
  const { article_id } = request.params;
  const username = request.body.username;
  const newComment = request.body.comment;

  insertCommentByArticleId(article_id, username, newComment)
    .then((returnedComment) => {
      response.status(201).send({ returnedComment });
    })
    .catch((err) => {
      next(err);
    });
};

exports.deleteCommentById = (request, response, next) => {
  const { comment_id } = request.params;
  removeCommentById(comment_id)
    .then(() => {
      response.status(204).send();
    })
    .catch((err) => {
      next(err);
    });
};
