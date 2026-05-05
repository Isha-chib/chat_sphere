const { Pool } = require("pg");

const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "realtime_chat_app",
  password: "1234",
  port: 5432,
});

module.exports = pool;