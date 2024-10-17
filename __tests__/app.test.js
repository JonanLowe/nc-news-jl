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
});

describe("tests GET endpoint api/articles/:article_id/comments", () => {
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

describe("tests POST endpoint api/articles/:articleid/comments", () => {
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
  test("POST: 400 responds with 'Invalid Username' when username is an empty string", () => {
    const testComment = {
      username: "",
      comment: "I'm__also_not_a_user",
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

describe("tests PATCH endpoint api/articles/:articleid", () => {
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
