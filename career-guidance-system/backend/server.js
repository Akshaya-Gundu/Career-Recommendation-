const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api/students", require("./routes/students"));
app.use("/api/careers", require("./routes/careers"));
app.use("/api/recommend", require("./routes/recommend"));
app.use("/api/skillgap", require("./routes/skillgap"));
app.use("/api/learning-plan", require("./routes/learning"));
app.use("/api/progress", require("./routes/progress"));

app.get("/api/health", (req, res) => res.json({ status: "ok" }));

app.use((error, req, res, next) => {
  console.error(error);
  res.status(500).json({ error: "Internal server error." });
});

module.exports = app;

if (require.main === module) {
  const PORT = process.env.PORT || 5000;
  require("./db").initializeDatabase().then(() => {
    app.listen(PORT, () => console.log(`Career Guidance API running on http://localhost:${PORT}`));
  }).catch((error) => {
    console.error(`Failed to initialize PostgreSQL database: ${error.message}`);
    process.exit(1);
  });
}
