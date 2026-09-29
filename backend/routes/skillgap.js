const express = require("express");
const router = express.Router();
const db = require("../db");
const { getFullProfile } = require("./students");

// GET /api/skillgap/:studentId/:careerId
router.get("/:studentId/:careerId", (req, res) => {
  const { studentId, careerId } = req.params;

  const profile = getFullProfile(studentId);
  if (!profile) return res.status(404).json({ error: "Student not found." });

  const career = db.prepare("SELECT * FROM careers WHERE id = ?").get(careerId);
  if (!career) return res.status(404).json({ error: "Career not found." });

  const requiredSkills = db
    .prepare("SELECT skill_name AS name, weight FROM career_skills WHERE career_id = ?")
    .all(careerId);

  const studentSkillMap = new Map(
    profile.skills.map((s) => [s.name.trim().toLowerCase(), s.proficiency])
  );

  const gaps = [];
  const strengths = [];

  for (const req of requiredSkills) {
    const proficiency = studentSkillMap.get(req.name.trim().toLowerCase()) || 0;
    const deficit = 5 - proficiency;

    if (deficit <= 0) {
      strengths.push({ skill: req.name, proficiency });
      continue;
    }

    const score = req.weight * deficit; // 0-15
    let severity;
    if (score >= 9) severity = "High";
    else if (score >= 4) severity = "Medium";
    else severity = "Low";

    gaps.push({
      skill: req.name,
      importance: req.weight,
      currentProficiency: proficiency,
      severity
    });
  }

  // Sort gaps: High -> Medium -> Low
  const order = { High: 0, Medium: 1, Low: 2 };
  gaps.sort((a, b) => order[a.severity] - order[b.severity]);

  res.json({
    studentId: Number(studentId),
    careerId: Number(careerId),
    careerName: career.name,
    strengths,
    gaps
  });
});

module.exports = router;
