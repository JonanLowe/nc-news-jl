const db = require("../db/connection");

exports.countCommentsByArticle_id = (article_id) => {
  return db
    .query(
    `
    SELECT * FROM comments
    WHERE article_id = $1;
    `,
      [article_id]
    )
    .then((result) => {
      console.log(result.rowCount, "<<result.rowCount")
      return result.rowCount;
    });
};
