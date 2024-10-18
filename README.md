# Northcoders News API

Dear Reader,

This API was built to mimic the backend of a real-world information service like Reddit.

The hosted version of this API can be found here:

    https://nc-news-c2tj.onrender.com

## Setup

### How to Clone:

Use the terminal to navigate to your chosen directory and enter:

    git clone https://github.com/JonanLowe/nc-news-jl

### Installing Dependencies:

To install all required dependencies, enter:

    npm i

### Create and Setup Databases:

Add the following files to the root of your project, and add them to .gitignore:

    .env.development
    .end.test

Add this variables .env.development:

     PGDATABASE = nc_news

Add this variable to .env.test:

    PGDATABASE = nc_news_test

To then seed the databases, in your terminal enter:

    npm run seteup-dbs
    npm run seed

## Testing

The test suite for this API is built with jest and supertest, using a test database. To run the tests using the test database, enter the following command:

    npm test app

## Requirements:

To run this database you will need:

    node.js 22.2.0
    PSQL 16.4

---

This portfolio project was created as part of a Digital Skills Bootcamp in Software Engineering provided by [Northcoders](https://northcoders.com/)
