const express = require("express");
const router = express.Router();
const db = require("../db");

// Create a student profile
router.post("/", (req, res) => {
  const { name, email, education, skills = [], interests = [], projects = [] } = req.body;

  if (!name || !name.trim()) {
    return res.status(400).json({ error: "Student name is required." });
  }

  const insertStudent = db.prepare(
    "INSERT INTO students (name, email, education) VALUES (?, ?, ?)"
  );
  const insertSkill = db.prepare(
    "INSERT INTO student_skills (student_id, skill_name, proficiency) VALUES (?, ?, ?)"
  );
  const insertInterest = db.prepare(
    "INSERT INTO student_interests (student_id, interest) VALUES (?, ?)"
  );
  const insertProject = db.prepare(
    "INSERT INTO student_projects (student_id, title, description) VALUES (?, ?, ?)"
  );

  const createAll = db.transaction(() => {
    const info = insertStudent.run(name.trim(), email || null, education || null);
    const studentId = info.lastInsertRowid;

    for (const s of skills) {
      if (!s.name) continue;
      insertSkill.run(studentId, s.name.trim(), Number(s.proficiency) || 1);
    }
    for (const i of interests) {
      if (!i) continue;
      insertInterest.run(studentId, String(i).trim().toLowerCase());
    }
    for (const p of projects) {
      if (!p.title) continue;
      insertProject.run(studentId, p.title.trim(), p.description || null);
    }
    return studentId;
  });

  const studentId = createAll();
  res.status(201).json(getFullProfile(studentId));
});

// Get a student profile
router.get("/:id", (req, res) => {
  const profile = getFullProfile(req.params.id);
  if (!profile) return res.status(404).json({ error: "Student not found." });
  res.json(profile);
});

function getFullProfile(studentId) {
  const student = db.prepare("SELECT * FROM students WHERE id = ?").get(studentId);
  if (!student) return null;

  const skills = db
    .prepare("SELECT skill_name AS name, proficiency FROM student_skills WHERE student_id = ?")
    .all(studentId);
  const interests = db
    .prepare("SELECT interest FROM student_interests WHERE student_id = ?")
    .all(studentId)
    .map((r) => r.interest);
  const projects = db
    .prepare("SELECT title, description FROM student_projects WHERE student_id = ?")
    .all(studentId);

  return { ...student, skills, interests, projects };
}

module.exports = router;
module.exports.getFullProfile = getFullProfile;
