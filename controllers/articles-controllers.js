const {
  selectArticles,
  selectArticleById,
  setVotesByArticleId,
} = require("../models/articles-models");

exports.getArticles = (request, response, next) => {
  const queries = Object.keys(request.query);
  const queriesGreenList = ["sort_by", "order", "topic"];

  queries.forEach((query) => {
    if (!queriesGreenList.includes(query)) {
      return response
        .status(400)
        .send({ msg: "Bad Request- NOT ON THE GREENLIST" });
    }
  });

  selectArticles(
    request.query.sort_by,
    request.query.order,
    request.query.topic
  )
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
      article.comment_count = Number(article.comment_count);
      return article;
    })
    .then((article) => {
      response.status(200).send({ article });
    })
    .catch((err) => {
      next(err);
    });
};

exports.patchVotesByArticleId = (request, response, next) => {
  const { article_id } = request.params;
  const { inc_votes } = request.body;

  if (typeof inc_votes !== "number") {
    return Promise.reject({
      status: 400,
      msg: "Votes must be a valid number",
    }).catch((err) => {
      next(err);
    });
  }

  setVotesByArticleId(article_id, inc_votes)
    .then((article) => {
      response.status(200).send({ article });
    })
    .catch((err) => {
      next(err);
    });
};
