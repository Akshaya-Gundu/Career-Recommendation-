const express = require("express");
const router = express.Router();
const db = require("../db");

async function withDetails(career) {
  const [skills, interests] = await Promise.all([
    db.query("SELECT skill_name AS name, weight FROM career_skills WHERE career_id = $1", [career.id]),
    db.query("SELECT interest FROM career_interests WHERE career_id = $1", [career.id])
  ]);
  return { ...career, skills: skills.rows, interests: interests.rows.map((r) => r.interest) };
}
router.get("/", async (req, res, next) => {
  try {
    const { rows } = await db.query("SELECT * FROM careers ORDER BY id");
    res.json(await Promise.all(rows.map(withDetails)));
  } catch (error) { next(error); }
});
router.get("/:id", async (req, res, next) => {
  try {
    const { rows } = await db.query("SELECT * FROM careers WHERE id = $1", [req.params.id]);
    if (!rows[0]) return res.status(404).json({ error: "Career not found." });
    res.json(await withDetails(rows[0]));
  } catch (error) { next(error); }
});
module.exports = router;
