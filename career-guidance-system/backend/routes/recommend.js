const express = require("express");
const router = express.Router();
const db = require("../db");
const { getFullProfile } = require("./students");

const SKILL_WEIGHT = 0.7; // how much skill-match contributes to the final score
const INTEREST_WEIGHT = 0.3; // how much interest-match contributes

// GET /api/recommend/:studentId
// Content-based recommender: scores every career by how well the student's
// skills (weighted by proficiency) and interests overlap with what the
// career requires, then returns careers ranked by match percentage.
router.get("/:studentId", (req, res) => {
  const profile = getFullProfile(req.params.studentId);
  if (!profile) return res.status(404).json({ error: "Student not found." });

  const studentSkillMap = new Map(
    profile.skills.map((s) => [normalize(s.name), s.proficiency])
  );
  const studentInterests = new Set(profile.interests.map(normalize));

  const careers = db.prepare("SELECT * FROM careers").all();

  const results = careers.map((career) => {
    const requiredSkills = db
      .prepare("SELECT skill_name AS name, weight FROM career_skills WHERE career_id = ?")
      .all(career.id);
    const careerInterests = db
      .prepare("SELECT interest FROM career_interests WHERE career_id = ?")
      .all(career.id)
      .map((r) => normalize(r.interest));

    // --- Skill match: weighted proficiency coverage of required skills ---
    let earned = 0;
    let possible = 0;
    const matchedSkills = [];
    const missingSkills = [];

    for (const req of requiredSkills) {
      possible += req.weight * 5; // max proficiency is 5
      const prof = studentSkillMap.get(normalize(req.name)) || 0;
      earned += req.weight * Math.min(prof, 5);
      if (prof > 0) {
        matchedSkills.push({ name: req.name, proficiency: prof, weight: req.weight });
      } else {
        missingSkills.push({ name: req.name, weight: req.weight });
      }
    }
    const skillScore = possible > 0 ? earned / possible : 0;

    // --- Interest match: overlap of interest tags ---
    let interestScore = 0;
    if (careerInterests.length > 0) {
      const overlap = careerInterests.filter((i) => studentInterests.has(i)).length;
      interestScore = overlap / careerInterests.length;
    }

    const finalScore = skillScore * SKILL_WEIGHT + interestScore * INTEREST_WEIGHT;

    return {
      careerId: career.id,
      careerName: career.name,
      description: career.description,
      matchPercent: Math.round(finalScore * 100),
      skillScorePercent: Math.round(skillScore * 100),
      interestScorePercent: Math.round(interestScore * 100),
      matchedSkills,
      missingSkills
    };
  });

  results.sort((a, b) => b.matchPercent - a.matchPercent);

  res.json({
    studentId: profile.id,
    studentName: profile.name,
    recommendations: results
  });
});

function normalize(str) {
  return String(str).trim().toLowerCase();
}

module.exports = router;
