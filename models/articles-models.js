const db = require("../db/connection");

exports.selectArticles = (
  sort_by = "created_at",
  order = "DESC",
  topic = null
) => {
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
  const topicsGreenList = ["mitch", "cats", "paper"];

  if (
    !sortByGreenList.includes(sort_by) ||
    !orderByGreenlist.includes(order) ||
    (topic && !topicsGreenList.includes(topic))
  ) {
    return Promise.reject({
      status: 400,
      msg: "Bad Request",
    });
  }

  const queryString1 = `
  SELECT articles.*,
  COUNT(comments.article_id) AS comment_count
  FROM articles 
  LEFT JOIN comments
  ON articles.article_id = comments.article_id`;

  let queryString2 = ``;

  if (topic) {
    queryString2 = `
  WHERE TOPIC = '${topic}' `;
  }

  const queryString3 = `
  GROUP BY articles.article_id
  ORDER BY ${sort_by} ${order};`;

  const queryString = queryString1 + queryString2 + queryString3;

  return db.query(queryString).then((result) => {
    return result.rows;
  });
};

exports.selectArticleById = (article_id) => {
  return db
    .query(
      `
      SELECT articles.*,
      COUNT(comments.article_id) AS comment_count
      FROM articles 
      LEFT JOIN comments
      ON articles.article_id = comments.article_id
      WHERE articles.article_id = $1
      GROUP BY articles.article_id;`,
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
