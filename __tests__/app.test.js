const app = require("../app");
const request = require("supertest");
const db = require("../db/connection");
const seed = require("../db/seeds/seed");
const data = require("../db/data/test-data");
const jsonEndpoints = require("../endpoints.json");

beforeEach(() => seed(data));
afterAll(() => db.end());

describe("tests GET bad URLs", () => {
  test("GET: 404 /badURL returns a 404 error code and a mesage of 'Not Found'", () => {
    return request(app)
      .get("/badURL")
      .expect(404)
      .then(({ body: { msg } }) => {
        expect(msg).toBe("Not Found");
      });
  });
});

describe("tests GET endpoint /api/topics", () => {
  test("GET: 200 /api/topics returns an array containing all topics, with properties 'slug' and 'description", () => {
    return request(app)
      .get("/api/topics")
      .expect(200)
      .then(({ body: { topics } }) => {
        expect(topics).toBeInstanceOf(Array);
        expect(topics.length).toBe(3);
        topics.forEach((topic) => {
          expect(topic).toMatchObject({
            slug: expect.any(String),
            description: expect.any(String),
          });
        });
      });
  });
});

describe("test GET endpoint /api", () => {
  test("GET: 200 responds with an object containing all available endpoints", () => {
    return request(app)
      .get("/api")
      .expect(200)
      .then(({ body }) => {
        expect(body.endpoints).toEqual(jsonEndpoints);
      });
  });
});

describe("tests GET endpoint /api/articles", () => {
  test("GET: 200 /api/articles returns an array containing all article objects, with the correct properties including no 'body' property, sorted by date in descending order", () => {
    return request(app)
      .get("/api/articles")
      .expect(200)
      .then(({ body: { articles } }) => {
        expect(articles).toBeInstanceOf(Array);
        expect(articles.length).toBe(13);
        expect(articles).toBeSortedBy("created_at", { descending: true });
        articles.forEach((article) => {
          expect(article).not.toHaveProperty("body");
          expect(article).toMatchObject({
            article_id: expect.any(Number),
            article_img_url: expect.any(String),
            author: expect.any(String),
            created_at: expect.any(String),
            title: expect.any(String),
            topic: expect.any(String),
            votes: expect.any(Number),
            comment_count: expect.any(Number),
          });
        });
      });
  });
  test("GET: 200 /api/articles?sort_by=comment_count returns the articles sorted by specified query (comment_count), and defaults to descending order when no second query is passed", () => {
    return request(app)
      .get("/api/articles?sort_by=comment_count")
      .expect(200)
      .then(({ body: { articles } }) => {
        expect(articles).toHaveLength(13);
        expect(articles).toBeSortedBy("comment_count", { descending: true });
      });
  });
  test("GET: 200 /api/articles?sort_by=comment_count&order=asc returns the articles sorted by comment_count, in ascending order", () => {
    return request(app)
      .get("/api/articles?sort_by=comment_count&order=asc")
      .expect(200)
      .then(({ body: { articles } }) => {
        expect(articles).toHaveLength(13);
        expect(articles).toBeSortedBy("comment_count", { ascending: true });
      });
  });
  describe("GET: 200 tests other valid category endpoints", () => {
    test("GET 200: api/articles/?sort_by=author", () => {
      return request(app)
        .get("/api/articles?sort_by=author")
        .expect(200)
        .then(({ body: { articles } }) => {
          expect(articles).toBeSortedBy("author", { descending: true });
        });
    });
    test("GET 200: api/articles/?sort_by=title", () => {
      return request(app)
        .get("/api/articles?sort_by=title")
        .expect(200)
        .then(({ body: { articles } }) => {
          expect(articles).toBeSortedBy("title", { descending: true });
        });
    });
    test("GET 200: api/articles/?sort_by=topic", () => {
      return request(app)
        .get("/api/articles?sort_by=topic")
        .expect(200)
        .then(({ body: { articles } }) => {
          expect(articles).toBeSortedBy("topic", { descending: true });
        });
    });
    test("GET 200: api/articles/?sort_by=created_at", () => {
      return request(app)
        .get("/api/articles?sort_by=created_at")
        .expect(200)
        .then(({ body: { articles } }) => {
          expect(articles).toBeSortedBy("created_at", { descending: true });
        });
    });
    test("GET 200: api/articles/?sort_by=article_img_url", () => {
      return request(app)
        .get("/api/articles?sort_by=article_img_url")
        .expect(200)
        .then(({ body: { articles } }) => {
          expect(articles).toBeSortedBy("article_img_url", {
            descending: true,
          });
        });
    });
    test("GET 200: api/articles/?sort_by=votes", () => {
      return request(app)
        .get("/api/articles?sort_by=votes")
        .expect(200)
        .then(({ body: { articles } }) => {
          expect(articles).toBeSortedBy("votes", {
            descending: true,
          });
        });
    });
  });
  test("GET: 200 /api/articles?order=asc returns articles sorted ascending by default category when passed an only 'order' in the query", () => {
    return request(app)
      .get("/api/articles?order=asc")
      .expect(200)
      .then(({ body: { articles } }) => {
        expect(articles).toBeSortedBy("created_at", { ascending: true });
      });
  });
  test("GET: 400 /api/articles?sort_by=not_a_category returns 'Bad Request' when querying sort_by an invalid category", () => {
    return request(app)
      .get("/api/articles?sort_by=not_a_category")
      .expect(400)
      .then(({ body: { msg } }) => {
        expect(msg).toBe("Bad Request");
      });
  });
  test("GET: 400 /api/articles?order=not_asc_or_desc returns 'Bad Request' when querying order by an invalid order", () => {
    return request(app)
      .get("/api/articles?sort_by=author&order=not_asc_or_desc")
      .expect(400)
      .then(({ body: { msg } }) => {
        expect(msg).toBe("Bad Request");
      });
  });
  test("GET: 400 /api/articles?sort_by=author&sort_by=title returns 'Bad Request' when passed the same query multiple times", () => {
    return request(app)
      .get("/api/articles?sort_by=author&sort_by=title")
      .expect(400)
      .then(({ body: { msg } }) => {
        expect(msg).toBe("Bad Request");
      });
  });
  test("GET: 400 /api/articles?who=author&order=asc returns 'Bad Request' when passed an invalid query", () => {
    return request(app)
      .get("/api/articles?who=author&order=asc")
      .expect(400)
      .then(({ body: { msg } }) => {
        expect(msg).toBe("Bad Request- NOT ON THE GREENLIST");
      });
  });
  test("GET: 400 /api/articles?sort_by=author;`DELETE * FROM comments`, responds with 400 and an error message when presented with SQL injection", () => {
    return request(app)
      .get("/api/articles?sort_by=author;`DELETE * FROM comments`")
      .expect(400)
      .then(({ body: { msg } }) => {
        expect(msg).toBe("Bad Request");
      });
  });
  test("GET: 200 /api/articles?topic=<topic> responds with all articles of the specified topic", () => {
    return request(app)
      .get("/api/articles?topic=mitch")
      .expect(200)
      .then(({ body: { articles } }) => {
        expect(articles).toHaveLength(12);
        articles.forEach((article) => {
          expect(article.topic).toBe("mitch");
        });
      });
  });
  test("GET: 200 /api/articles?sort_by=author&order=asc&topic=mitch responds correctly to all queries", () => {
    return request(app)
      .get("/api/articles?sort_by=author&order=asc&topic=mitch")
      .expect(200)
      .then(({ body: { articles } }) => {
        expect(articles).toHaveLength(12);
        expect(articles).toBeSortedBy("author", { ascending: true });
        articles.forEach((article) => {
          expect(article.topic).toBe("mitch");
        });
      });
  });
  test("GET: 200 /api/articles?topic=mitch responds with correct articles", () => {
    return request(app)
      .get("/api/articles?topic=mitch")
      .expect(200)
      .then(({ body: { articles } }) => {
        expect(articles).toHaveLength(12);
        articles.forEach((article) => {
          expect(article.topic).toBe("mitch");
        });
      });
  });
  test("GET: 400 /api/topic=not_a_topic responds with '400: Bad Request' when given an invalid topic", () => {
    return request(app)
      .get("/api/articles?topic=not_a_topic")
      .expect(400)
      .then(({ body: { msg } }) => {
        expect(msg).toBe("Bad Request - not a valid topic");
      });
  });
});

describe("tests GET endpoint /api/users", () => {
  test("GET:200 /api/users serves an array containing all users, with properties username, name, avatar_url", () => {
    return request(app)
      .get("/api/users")
      .expect(200)
      .then(({ body: { users } }) => {
        expect(users).toBeInstanceOf(Array);
        expect(users.length).toBe(4);
        users.forEach((user) => {
          expect(user).toMatchObject({
            username: expect.any(String),
            name: expect.any(String),
            avatar_url: expect.any(String),
          });
        });
      });
  });
});

describe("tests GET endpoint /api/articles/:article_id", () => {
  test("GET: 200 responds with the correct article object, with the correct properties", () => {
    return request(app)
      .get("/api/articles/2")
      .expect(200)
      .then(({ body: { article } }) => {
        expect(article.article_id).toBe(2);
        expect(article).toMatchObject({
          article_id: expect.any(Number),
          title: expect.any(String),
          topic: expect.any(String),
          author: expect.any(String),
          body: expect.any(String),
          created_at: expect.any(String),
          votes: expect.any(Number),
          article_img_url: expect.any(String),
        });
      });
  });
  test("GET: 200 responds with the correct article object, with properties now including comment_count", () => {
    return request(app)
      .get("/api/articles/2")
      .expect(200)
      .then(({ body: { article } }) => {
        expect(article.article_id).toBe(2);
        expect(article).toMatchObject({
          comment_count: expect.any(Number),
        });
      });
  });
  test("GET: 404 responds with 'Article Not Found' when request is made with a valid but non-existent id", () => {
    return request(app)
      .get("/api/articles/500")
      .expect(404)
      .then(({ body: { msg } }) => {
        expect(msg).toBe("Article Not Found");
      });
  });
  test("GET: 400 responds with a valid error message when request is made with an invalid id", () => {
    return request(app)
      .get("/api/articles/not-a-number")
      .expect(400)
      .then(({ body: { msg } }) => {
        expect(msg).toBe("Bad Request");
      });
  });
});

describe("tests GET endpoint /api/articles/:article_id/comments", () => {
  test("GET: 200 /api/articles/:article_id/comments serves an array of all comments for a selected article based on ID", () => {
    return request(app)
      .get("/api/articles/1/comments")
      .expect(200)
      .then(({ body: { comments } }) => {
        expect(comments).toBeInstanceOf(Array);
        expect(comments.length).toBe(11);
        expect(comments).toBeSortedBy("created_at", { descending: true });
        comments.forEach((comment) => {
          expect(comment).toMatchObject({
            comment_id: expect.any(Number),
            votes: expect.any(Number),
            created_at: expect.any(String),
            author: expect.any(String),
            body: expect.any(String),
            article_id: expect.any(Number),
          });
        });
      });
  });
  test("GET: 200 /api/articles/:article_id/comments serves an empty array when passed a valid article with no comments", () => {
    return request(app)
      .get("/api/articles/2/comments")
      .expect(200)
      .then(({ body: { comments } }) => {
        expect(comments).toBeInstanceOf(Array);
        expect(comments).toHaveLength(0);
      });
  });
  test("GET: 404 responds with 'Article Not Found' when request is made with a valid but non-existent article id", () => {
    return request(app)
      .get("/api/articles/500/comments")
      .expect(404)
      .then(({ body: { msg } }) => {
        expect(msg).toBe("Article Not Found");
      });
  });
  test("GET: 400 responds with a valid error message when request is made with an invalid id", () => {
    return request(app)
      .get("/api/articles/not-a-number/comments")
      .expect(400)
      .then(({ body: { msg } }) => {
        expect(msg).toBe("Bad Request");
      });
  });
});

describe("tests POST endpoint /api/articles/:articleid/comments", () => {
  test("POST: 201 responds with a new comment when posting a comment from an existing user, to an existing article with no comments and increases comment count of the correct article", () => {
    const testComment = {
      username: "rogersop",
      comment: "I like it a bit, but not loads",
    };
    const countComments = () => {
      return request(app).get("/api/articles/2/comments");
    };
    return request(app)
      .post("/api/articles/2/comments")
      .send(testComment)
      .expect(201)
      .then(({ body: { returnedComment } }) => {
        expect(returnedComment).toMatchObject({
          article_id: 2,
          author: "rogersop",
          body: "I like it a bit, but not loads",
          comment_id: 19,
          created_at: expect.any(String),
        });
      })
      .then(() => {
        return countComments();
      })
      .then(({ body: { comments } }) => {
        expect(comments.length).toBe(1);
      });
  });
  test("POST: 201 responds with a new comment when posting a comment from an existing user, to an existing article which has comments already, and increases comment count of the correct article", () => {
    const testComment = {
      username: "icellusedkars",
      comment: "I like this one more",
    };

    const countComments = () => {
      return request(app).get("/api/articles/1/comments");
    };

    return request(app)
      .post("/api/articles/1/comments")
      .send(testComment)
      .expect(201)
      .then(({ body: { returnedComment } }) => {
        expect(returnedComment).toMatchObject({
          article_id: 1,
          author: "icellusedkars",
          body: "I like this one more",
          comment_id: 19,
          created_at: expect.any(String),
        });
      })
      .then(() => {
        return countComments();
      })
      .then(({ body: { comments } }) => {
        expect(comments.length).toBe(12);
      });
  });
  test("POST: 201 posts and responds with a correct comment when extra keys are also present on the comment object", () => {
    const testComment = {
      username: "icellusedkars",
      spareKey1: [],
      comment: "One does not simply walk into Mordor",
      anotherKey: 500,
    };
    return request(app)
      .post("/api/articles/1/comments")
      .send(testComment)
      .expect(201)
      .then(({ body: { returnedComment } }) => {
        expect(returnedComment).toMatchObject({
          article_id: 1,
          author: "icellusedkars",
          body: "One does not simply walk into Mordor",
          comment_id: 19,
          created_at: expect.any(String),
        });
      });
  });
  test("POST: 404 responds with 'Article Not Found' when request is made with a valid but non-existent article id", () => {
    const testComment = {
      username: "icellusedkars",
      comment: "I like this one more",
    };
    return request(app)
      .post("/api/articles/500/comments")
      .send(testComment)
      .expect(404)
      .then(({ body: { msg } }) => {
        expect(msg).toBe("Article Not Found");
      });
  });
  test("POST: 400 responds with 'Bad Request' when request is made with an invalid article id", () => {
    const testComment = {
      username: "icellusedkars",
      comment: "I like this one more",
    };
    return request(app)
      .post("/api/articles/not-a-number/comments")
      .send(testComment)
      .expect(400)
      .then(({ body: { msg } }) => {
        expect(msg).toBe("Bad Request");
      });
  });
  test("POST: 400 responds with 'Invalid Username' when username is a string that does not match a user from the users database", () => {
    const testComment = {
      username: "not_a_user",
      comment: "I'm_not_a_user",
    };
    return request(app)
      .post("/api/articles/1/comments")
      .send(testComment)
      .expect(400)
      .then(({ body: { msg } }) => {
        expect(msg).toBe("Invalid Username");
      });
  });
  test("POST: 400 responds with 'Invalid Username' when username is an invalid data type", () => {
    const testComment = {
      username: 6,
      comment: "COMMENT",
    };
    return request(app)
      .post("/api/articles/1/comments")
      .send(testComment)
      .expect(400)
      .then(({ body: { msg } }) => {
        expect(msg).toBe("Invalid Username");
      });
  });
  test("POST: 400 responds with 'Comment cannot be blank' when an empty string is posted as a comment", () => {
    const testComment = {
      username: "icellusedkars",
      comment: "",
    };
    return request(app)
      .post("/api/articles/1/comments")
      .send(testComment)
      .expect(400)
      .then(({ body: { msg } }) => {
        expect(msg).toBe("Comment cannot be blank");
      });
  });
  test("POST: 400 responds with 'Invalid Comment' when comment is an invalid data type", () => {
    commentBody = [];
    const testComment = {
      username: "icellusedkars",
      comment: commentBody,
    };
    return request(app)
      .post("/api/articles/1/comments")
      .send(testComment)
      .expect(400)
      .then(({ body: { msg } }) => {
        expect(msg).toBe("Invalid Comment Type");
      });
  });
  test("POST: 400 responds with 'Comment must have both username and body properties' when username is not present", () => {
    const testComment = {
      body: "Expecto Patronum!",
    };
    return request(app)
      .post("/api/articles/1/comments")
      .send(testComment)
      .expect(400)
      .then(({ body: { msg } }) => {
        expect(msg).toBe("Comment must have both username and body properties");
      });
  });
  test("POST: 400 responds with 'Comment must have both username and body properties' when body is not present", () => {
    const testComment = {
      username: "lurker",
    };
    return request(app)
      .post("/api/articles/1/comments")
      .send(testComment)
      .expect(400)
      .then(({ body: { msg } }) => {
        expect(msg).toBe("Comment must have both username and body properties");
      });
  });
});

describe("tests PATCH endpoint /api/articles/:articleid", () => {
  test("PATCH: 200 responds with an updated article with an increased vote count when passed an article with 'votes' property, and a positive integer", () => {
    const newVote = 10;
    const votes = {
      inc_votes: newVote,
    };
    return request(app)
      .patch("/api/articles/1")
      .send(votes)
      .expect(200)
      .then(({ body: { article } }) => {
        expect(article).toMatchObject({
          article_id: 1,
          title: "Living in the shadow of a great man",
          topic: "mitch",
          author: "butter_bridge",
          body: "I find this existence challenging",
          created_at: expect.any(String),
          votes: 110,
          author: expect.any(String),
          article_img_url:
            "https://images.pexels.com/photos/158651/news-newsletter-newspaper-information-158651.jpeg?w=700&h=700",
        });
      });
  });
  test("PATCH: 200 responds with an updated article with a decreased vote count when passed an article with a 'votes' property and a negative integer", () => {
    const newVote = -40;
    const votes = {
      inc_votes: newVote,
    };
    return request(app)
      .patch("/api/articles/1")
      .send(votes)
      .expect(200)
      .then(({ body: { article } }) => {
        expect(article).toMatchObject({
          article_id: 1,
          title: "Living in the shadow of a great man",
          topic: "mitch",
          author: "butter_bridge",
          body: "I find this existence challenging",
          created_at: expect.any(String),
          votes: 60,
          author: expect.any(String),
          article_img_url:
            "https://images.pexels.com/photos/158651/news-newsletter-newspaper-information-158651.jpeg?w=700&h=700",
        });
      });
  });
  test("PATCH: 200 responds with an updated article with an increased vote count when passed an article with a votes property and a positive integer, along with extra properties", () => {
    const newVote = 50;
    const votes = {
      cheeses: ["cheddar", "gouda", "emmental", "stilton", "brie"],
      inc_votes: newVote,
      aNumber: 4,
    };
    return request(app)
      .patch("/api/articles/1")
      .send(votes)
      .expect(200)
      .then(({ body: { article } }) => {
        expect(article).toMatchObject({
          article_id: 1,
          title: "Living in the shadow of a great man",
          topic: "mitch",
          author: "butter_bridge",
          body: "I find this existence challenging",
          created_at: expect.any(String),
          votes: 150,
          author: expect.any(String),
          article_img_url:
            "https://images.pexels.com/photos/158651/news-newsletter-newspaper-information-158651.jpeg?w=700&h=700",
        });
      });
  });
  test("PATCH: 200 responds with an updated article with a new votes property with the value of 'newVote' when passed an article without a 'votes' property and an integer", () => {
    const newVote = 10;
    const votes = {
      inc_votes: newVote,
    };
    return request(app)
      .patch("/api/articles/6")
      .send(votes)
      .expect(200)
      .then(({ body: { article } }) => {
        expect(article).toMatchObject({
          article_id: 6,
          title: "A",
          topic: "mitch",
          author: "icellusedkars",
          body: "Delicious tin of cat food",
          created_at: expect.any(String),
          votes: newVote,
          article_img_url:
            "https://images.pexels.com/photos/158651/news-newsletter-newspaper-information-158651.jpeg?w=700&h=700",
        });
      });
  });
  test("PATCH: 404 responds with 'Article Not Found' when request is made with a valid but non-existant article id", () => {
    const newVote = -40;
    const votes = {
      inc_votes: newVote,
    };
    return request(app)
      .patch("/api/articles/600000")
      .send(votes)
      .expect(404)
      .then(({ body: { msg } }) => {
        expect(msg).toBe("Article Not Found");
      });
  });
  test("PATCH: 400 responds with 'Bad Request' when request is made with an invalid article id", () => {
    const newVote = -40;
    const votes = {
      inc_votes: newVote,
    };
    return request(app)
      .patch("/api/articles/not-a-number")
      .send(votes)
      .expect(400)
      .then(({ body: { msg } }) => {
        expect(msg).toBe("Bad Request");
      });
  });
  test("PATCH: 400 responds with 'Votes must be a number' when votes is not a number", () => {
    const newVote = "not-a-number";
    const votes = {
      inc_votes: newVote,
    };
    return request(app)
      .patch("/api/articles/1")
      .send(votes)
      .expect(400)
      .then(({ body: { msg } }) => {
        expect(msg).toBe("Votes must be a valid number");
      });
  });
  test("PATCH: 400 responds with 'Votes must be a number' when request is made with no votes key", () => {
    const votes = {};
    return request(app)
      .patch("/api/articles/1")
      .send(votes)
      .expect(400)
      .then(({ body: { msg } }) => {
        expect(msg).toBe("Votes must be a valid number");
      });
  });
});

describe("tests DELETE endpoint /api/comments/comment:id", () => {
  test("DELETE: 204 deletes a specified comment, reducing the number of comments for that article in the database", () => {
    const countComments = () => {
      return request(app).get("/api/articles/9/comments");
    };

    return countComments()
      .then(({ body: { comments } }) => {
        expect(comments.length).toBe(2);
      })
      .then(() => {
        return request(app)
          .delete("/api/comments/1")
          .expect(204)
          .then((response) => {
            expect(response.noContent).toBe(true);
          })
          .then(() => {
            return countComments();
          })
          .then(({ body: { comments } }) => {
            expect(comments.length).toBe(1);
          });
      });
  });
  test("DELETE: 400 returns 'Comment Not Found' when given a valid comment id that is not in the database", () => {
    return request(app)
      .delete("/api/comments/200")
      .expect(400)
      .then(({ body: { msg } }) => {
        expect(msg).toBe("Comment Not Found");
      });
  });
  test("DELETE: 404 returns 'Bad Request' when given an invalid comment id", () => {
    return request(app)
      .delete("/api/comments/not-a-number")
      .expect(400)
      .then(({ body: { msg } }) => {
        expect(msg).toBe("Bad Request");
      });
  });
});
