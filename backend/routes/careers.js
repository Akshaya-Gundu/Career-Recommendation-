const express = require("express");
const router = express.Router();
const db = require("../db");

router.get("/", (req, res) => {
  const careers = db.prepare("SELECT * FROM careers").all();
  const result = careers.map((c) => ({
    ...c,
    skills: db
      .prepare("SELECT skill_name AS name, weight FROM career_skills WHERE career_id = ?")
      .all(c.id),
    interests: db
      .prepare("SELECT interest FROM career_interests WHERE career_id = ?")
      .all(c.id)
      .map((r) => r.interest)
  }));
  res.json(result);
});

router.get("/:id", (req, res) => {
  const c = db.prepare("SELECT * FROM careers WHERE id = ?").get(req.params.id);
  if (!c) return res.status(404).json({ error: "Career not found." });
  c.skills = db
    .prepare("SELECT skill_name AS name, weight FROM career_skills WHERE career_id = ?")
    .all(c.id);
  c.interests = db
    .prepare("SELECT interest FROM career_interests WHERE career_id = ?")
    .all(c.id)
    .map((r) => r.interest);
  res.json(c);
});

module.exports = router;
