const express = require("express");
const cors = require("cors");

require("./db"); // initializes + seeds SQLite on first run

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

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Career Guidance API running on http://localhost:${PORT}`);
});
