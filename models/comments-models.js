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
      if (results.rowCount < 1) {
        return Promise.reject({
          status: 404,
          msg: "No comments available: Article does not exist",
        });
      }
      return results.rows;
    });
};