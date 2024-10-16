const { selectArticleById } = require("../models/articles-models");
const { selectCommentsByArticleId } = require("../models/comments-models");

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
