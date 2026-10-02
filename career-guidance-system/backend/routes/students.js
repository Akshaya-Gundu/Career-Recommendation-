const express = require("express");
const router = express.Router();
const db = require("../db");

router.post("/", async (req, res, next) => {
  const { name, email, education, skills = [], interests = [], projects = [] } = req.body;
  if (typeof name !== "string" || !name.trim()) return res.status(400).json({ error: "Student name is required." });
  if (![skills, interests, projects].every(Array.isArray)) {
    return res.status(400).json({ error: "Skills, interests, and projects must be arrays." });
  }
  let client;
  let transactionStarted = false;
  try {
    client = await db.pool.connect();
    await client.query("BEGIN");
    transactionStarted = true;
    const inserted = await client.query(
      "INSERT INTO students (name, email, education) VALUES ($1, $2, $3) RETURNING id",
      [name.trim(), email || null, education || null]
    );
    const id = inserted.rows[0].id;
    for (const s of skills) if (s.name) await client.query(
      "INSERT INTO student_skills (student_id, skill_name, proficiency) VALUES ($1, $2, $3)",
      [id, s.name.trim(), Number(s.proficiency) || 1]
    );
    for (const i of interests) if (i) await client.query(
      "INSERT INTO student_interests (student_id, interest) VALUES ($1, $2)", [id, String(i).trim().toLowerCase()]
    );
    for (const p of projects) if (p.title) await client.query(
      "INSERT INTO student_projects (student_id, title, description) VALUES ($1, $2, $3)",
      [id, p.title.trim(), p.description || null]
    );
    await client.query("COMMIT");
    res.status(201).json(await getFullProfile(id));
  } catch (error) {
    if (transactionStarted) await client.query("ROLLBACK");
    next(error);
  } finally { client?.release(); }
});

router.get("/:id", async (req, res, next) => {
  try {
    const profile = await getFullProfile(req.params.id);
    if (!profile) return res.status(404).json({ error: "Student not found." });
    res.json(profile);
  } catch (error) { next(error); }
});

async function getFullProfile(id) {
  const { rows: students } = await db.query("SELECT * FROM students WHERE id = $1", [id]);
  if (!students[0]) return null;
  const [skills, interests, projects] = await Promise.all([
    db.query("SELECT skill_name AS name, proficiency FROM student_skills WHERE student_id = $1", [id]),
    db.query("SELECT interest FROM student_interests WHERE student_id = $1", [id]),
    db.query("SELECT title, description FROM student_projects WHERE student_id = $1", [id])
  ]);
  return { ...students[0], skills: skills.rows, interests: interests.rows.map((r) => r.interest), projects: projects.rows };
}

module.exports = router;
module.exports.getFullProfile = getFullProfile;
