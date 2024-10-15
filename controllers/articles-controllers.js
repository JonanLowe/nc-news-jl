const {
  selectArticles,
  selectArticleById,
} = require("../models/articles-models");
const { countCommentsByArticle_id } = require("../models/comments-models");

exports.getArticles = (request, response, next) => {
  selectArticles()
    .then((articles) => {
      return articles.map((article) => {
        article.comment_count = Number(article.comment_count);
        delete article.body;
        return article;
      });
    })
    .then((articles) => {
      response.status(200).send({ articles });
    })
    .catch((err) => {
      next(err);
    });
};

exports.getArticleById = (request, response, next) => {
  const { article_id } = request.params;
  selectArticleById(article_id)
    .then((article) => {
      response.status(200).send({ article });
    })
    .catch((err) => {
      next(err);
    });
};
