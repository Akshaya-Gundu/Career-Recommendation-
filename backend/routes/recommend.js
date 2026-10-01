const express = require("express");
const router = express.Router();
const db = require("../db");
const { getFullProfile } = require("./students");
const normalize = (s) => String(s).trim().toLowerCase();

router.get("/:studentId", async (req, res, next) => {
  try {
    const profile = await getFullProfile(req.params.studentId);
    if (!profile) return res.status(404).json({ error: "Student not found." });
    const [careerResult, skillResult, interestResult] = await Promise.all([
      db.query("SELECT * FROM careers"), db.query("SELECT career_id, skill_name AS name, weight FROM career_skills"),
      db.query("SELECT career_id, interest FROM career_interests")
    ]);
    const studentSkills = new Map(profile.skills.map((s) => [normalize(s.name), s.proficiency]));
    const studentInterests = new Set(profile.interests.map(normalize));
    const results = careerResult.rows.map((career) => {
      const required = skillResult.rows.filter((s) => String(s.career_id) === String(career.id));
      const interests = interestResult.rows.filter((i) => String(i.career_id) === String(career.id)).map((i) => normalize(i.interest));
      let earned = 0, possible = 0;
      const matchedSkills = [], missingSkills = [];
      for (const skill of required) {
        possible += skill.weight * 5;
        const proficiency = studentSkills.get(normalize(skill.name)) || 0;
        earned += skill.weight * Math.min(proficiency, 5);
        if (proficiency) matchedSkills.push({ name: skill.name, proficiency, weight: skill.weight });
        else missingSkills.push({ name: skill.name, weight: skill.weight });
      }
      const skillScore = possible ? earned / possible : 0;
      const interestScore = interests.length ? interests.filter((i) => studentInterests.has(i)).length / interests.length : 0;
      return { careerId: career.id, careerName: career.name, description: career.description,
        matchPercent: Math.round((skillScore * .7 + interestScore * .3) * 100),
        skillScorePercent: Math.round(skillScore * 100), interestScorePercent: Math.round(interestScore * 100), matchedSkills, missingSkills };
    }).sort((a, b) => b.matchPercent - a.matchPercent);
    res.json({ studentId: profile.id, studentName: profile.name, recommendations: results });
  } catch (error) { next(error); }
});
module.exports = router;
