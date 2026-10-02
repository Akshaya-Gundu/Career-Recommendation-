const express = require("express");
const router = express.Router();
const db = require("../db");
const { getFullProfile } = require("./students");
const resources = require("../data/resources");
const weeks = { High: 4, Medium: 2, Low: 1 };
router.get("/:studentId/:careerId", async (req, res, next) => {
  try {
    const { studentId, careerId } = req.params;
    const profile = await getFullProfile(studentId);
    if (!profile) return res.status(404).json({ error: "Student not found." });
    const [careerResult, requiredResult] = await Promise.all([
      db.query("SELECT * FROM careers WHERE id = $1", [careerId]),
      db.query("SELECT skill_name AS name, weight FROM career_skills WHERE career_id = $1", [careerId])
    ]);
    const career = careerResult.rows[0];
    if (!career) return res.status(404).json({ error: "Career not found." });
    const studentSkills = new Map(profile.skills.map((s) => [s.name.trim().toLowerCase(), s.proficiency]));
    const plan = [];
    for (const skill of requiredResult.rows) {
      const deficit = 5 - (studentSkills.get(skill.name.trim().toLowerCase()) || 0);
      if (deficit <= 0) continue;
      const score = skill.weight * deficit;
      const severity = score >= 9 ? "High" : score >= 4 ? "Medium" : "Low";
      await db.query(`INSERT INTO learning_progress (student_id, career_id, skill_name, severity, status, progress_percent)
        VALUES ($1, $2, $3, $4, 'not_started', 0)
        ON CONFLICT(student_id, career_id, skill_name) DO UPDATE SET severity = EXCLUDED.severity`,
        [studentId, careerId, skill.name, severity]);
      plan.push({ skill: skill.name, severity, estimatedWeeks: weeks[severity], resources: resources[skill.name] || [{
        title: `Search: "${skill.name} tutorial for beginners"`,
        url: `https://www.google.com/search?q=${encodeURIComponent(skill.name + " tutorial for beginners")}`, type: "search"
      }] });
    }
    const order = { High: 0, Medium: 1, Low: 2 };
    plan.sort((a, b) => order[a.severity] - order[b.severity]);
    res.json({ studentId: Number(studentId), careerId: Number(careerId), careerName: career.name,
      totalEstimatedWeeks: plan.reduce((sum, p) => sum + p.estimatedWeeks, 0), plan });
  } catch (error) { next(error); }
});
module.exports = router;
