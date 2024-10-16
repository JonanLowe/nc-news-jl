const db = require("../db/connection");

exports.selectCommentsByArticleId = (article_id) => {
  return db
    .query(
      `SELECT *
     FROM comments
    WHERE article_id = $1
    ORDER BY created_at DESC;`,
      [article_id]
    )
    .then((results) => {
      return results.rows;
    });
};

exports.insertCommentByArticleId = (article_id, username, newComment) => {
  return db
    .query(
      `INSERT INTO comments
    (article_id, author, body)
    VALUES ($1, $2, $3)
    RETURNING *;`,
      [article_id, username, newComment]
    )
    .then(({ rows }) => {
      if (rows[0].body.length < 1) {
        return Promise.reject({ status: 400, msg: "Comment cannot be blank" });
      }
      return rows[0];
    });
};
