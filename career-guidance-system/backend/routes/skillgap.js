const express = require("express");
const router = express.Router();
const db = require("../db");
const { getFullProfile } = require("./students");
router.get("/:studentId/:careerId", async (req, res, next) => {
  try {
    const { studentId, careerId } = req.params;
    const profile = await getFullProfile(studentId);
    if (!profile) return res.status(404).json({ error: "Student not found." });
    const [careerResult, skillsResult] = await Promise.all([
      db.query("SELECT * FROM careers WHERE id = $1", [careerId]),
      db.query("SELECT skill_name AS name, weight FROM career_skills WHERE career_id = $1", [careerId])
    ]);
    const career = careerResult.rows[0];
    if (!career) return res.status(404).json({ error: "Career not found." });
    const studentSkills = new Map(profile.skills.map((s) => [s.name.trim().toLowerCase(), s.proficiency]));
    const gaps = [], strengths = [];
    for (const required of skillsResult.rows) {
      const proficiency = studentSkills.get(required.name.trim().toLowerCase()) || 0;
      const deficit = 5 - proficiency;
      if (deficit <= 0) { strengths.push({ skill: required.name, proficiency }); continue; }
      const score = required.weight * deficit;
      gaps.push({ skill: required.name, importance: required.weight, currentProficiency: proficiency,
        severity: score >= 9 ? "High" : score >= 4 ? "Medium" : "Low" });
    }
    const order = { High: 0, Medium: 1, Low: 2 };
    gaps.sort((a, b) => order[a.severity] - order[b.severity]);
    res.json({ studentId: Number(studentId), careerId: Number(careerId), careerName: career.name, strengths, gaps });
  } catch (error) { next(error); }
});
module.exports = router;
