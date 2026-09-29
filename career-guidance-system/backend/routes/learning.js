const express = require("express");
const router = express.Router();
const db = require("../db");
const { getFullProfile } = require("./students");
const resourceCatalog = require("../data/resources");

const WEEKS_BY_SEVERITY = { High: 4, Medium: 2, Low: 1 };

// GET /api/learning-plan/:studentId/:careerId
// Builds a plan from the current skill gaps and ensures a progress row
// exists per gap skill (so ProgressTracker has something to show/update).
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

  const upsert = db.prepare(`
    INSERT INTO learning_progress (student_id, career_id, skill_name, severity, status, progress_percent)
    VALUES (?, ?, ?, ?, 'not_started', 0)
    ON CONFLICT(student_id, career_id, skill_name) DO UPDATE SET severity = excluded.severity
  `);

  const plan = [];

  for (const req of requiredSkills) {
    const proficiency = studentSkillMap.get(req.name.trim().toLowerCase()) || 0;
    const deficit = 5 - proficiency;
    if (deficit <= 0) continue;

    const score = req.weight * deficit;
    let severity;
    if (score >= 9) severity = "High";
    else if (score >= 4) severity = "Medium";
    else severity = "Low";

    upsert.run(studentId, careerId, req.name, severity);

    plan.push({
      skill: req.name,
      severity,
      estimatedWeeks: WEEKS_BY_SEVERITY[severity],
      resources: resourceCatalog[req.name] || [
        {
          title: `Search: "${req.name} tutorial for beginners"`,
          url: `https://www.google.com/search?q=${encodeURIComponent(req.name + " tutorial for beginners")}`,
          type: "search"
        }
      ]
    });
  }

  const order = { High: 0, Medium: 1, Low: 2 };
  plan.sort((a, b) => order[a.severity] - order[b.severity]);

  const totalWeeks = plan.reduce((sum, p) => sum + p.estimatedWeeks, 0);

  res.json({
    studentId: Number(studentId),
    careerId: Number(careerId),
    careerName: career.name,
    totalEstimatedWeeks: totalWeeks,
    plan
  });
});

module.exports = router;
