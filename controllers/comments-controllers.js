const { selectCommentsByArticleId } = require("../models/comments-models");

exports.getCommentsByArticleId = (request, response, next) => {
  const { article_id } = request.params;
  selectCommentsByArticleId(article_id)
    .then((comments) => {
      response.status(200).send({ comments });
    })
    .catch((err) => {
      next(err);
    });
};
