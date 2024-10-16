const db = require("../db/connection");

exports.selectArticles = () => {
  return db
    .query(
      `SELECT articles.*, COUNT(comments.article_id) AS comment_count
       FROM articles
       LEFT JOIN comments
       ON articles.article_id = comments.article_id
       GROUP BY articles.article_id
       ORDER BY created_at DESC;`
    )
    .then((result) => {
      return result.rows;
    });
};

exports.selectArticleById = (article_id) => {
  return db
    .query(
      `SELECT * FROM articles
      WHERE article_id = $1;`,
      [article_id]
    )
    .then((result) => {
      if (result.rowCount < 1) {
        return Promise.reject({ status: 404, msg: "Article Not Found" });
      }
      return result.rows[0];
    });
};
