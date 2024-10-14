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

describe("tests endpoint /api/topics", () => {
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

describe("test endpoint /api", () => {
  test("GET: 200 responds with an object containing all available endpoints", () => {
    return request(app)
      .get("/api")
      .expect(200)
      .then(({ body }) => {
        expect(body.endpoints).toEqual(jsonEndpoints);
      });
  });
});

describe("tests endpoint /api/articles/:article_id", () => {
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
  test("GET: 404 responds with 'Not Found' when request is made with a valid but non-existent id", () => {
    return request(app)
      .get("/api/articles/500")
      .expect(404)
      .then(({ body : { msg } }) => {
        expect(msg).toBe("Article does not exist");
      });
  });
  test("GET: 400 responds with a valid error message when request is made with an invalid id", () => {
    return request(app)
      .get("/api/articles/not-a-number")
      .expect(400)
      .then(({ body : { msg } }) => {
        expect(msg).toBe("Bad request");
      });
  });
});
