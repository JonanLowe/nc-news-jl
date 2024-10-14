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
  test("GET: 200 /api/topics returns an array containg all topics, with properties 'slug' and 'description", () => {
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
