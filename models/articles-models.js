const db = require("../db/connection");

exports.selectArticles = (sort_by = "created_at", order = "DESC") => {
  if (typeof order === "string") {
    order = order.toUpperCase();
  }

  const sortByGreenList = [
    "author",
    "title",
    "topic",
    "created_at",
    "article_img_url",
    "comment_count",
    "votes",
  ];
  const orderByGreenlist = ["ASC", "DESC"];

  if (!sortByGreenList.includes(sort_by) || !orderByGreenlist.includes(order)) {
    return Promise.reject({
      status: 400,
      msg: "Bad Request",
    });
  }

  return db
    .query(
      `
    SELECT articles.*,
    COUNT(comments.article_id) AS comment_count
    FROM articles
    LEFT JOIN comments
    ON articles.article_id = comments.article_id
    GROUP BY articles.article_id
    ORDER BY ${sort_by} ${order};`
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

exports.setVotesByArticleId = (article_id, inc_votes) => {
  return db
    .query(
      `UPDATE articles
      SET votes = votes + $2
      WHERE article_id = $1 RETURNING*
      `,
      [article_id, inc_votes]
    )
    .then((result) => {
      if (result.rowCount < 1) {
        return Promise.reject({ status: 404, msg: "Article Not Found" });
      }
      return result.rows[0];
    });
};
