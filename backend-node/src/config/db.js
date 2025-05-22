require("dotenv").config({
  path: process.env.NODE_ENV === "test" ? ".test.env" : ".env",
});

database_url = `postgresql://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`;
const { Pool } = require("pg");
const pool = new Pool({
  connectionString: database_url,
});

module.exports = pool;
