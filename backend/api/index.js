const app = require("../server");
const { initializeDatabase } = require("../db");

let initialized;
module.exports = async (req, res) => {
  initialized ||= initializeDatabase();
  try {
    await initialized;
    return app(req, res);
  } catch (error) {
    console.error(`Failed to initialize PostgreSQL database: ${error.message}`);
    return res.status(500).json({ error: "Database initialization failed." });
  }
};
