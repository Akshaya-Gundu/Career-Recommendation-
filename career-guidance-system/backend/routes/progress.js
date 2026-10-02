const express = require("express");
const router = express.Router();
const db = require("../db");
router.get("/:studentId/:careerId", async (req, res, next) => {
  try {
    const { studentId, careerId } = req.params;
    const { rows } = await db.query(`SELECT id, skill_name AS skill, severity, status,
      progress_percent AS "progressPercent", updated_at AS "updatedAt"
      FROM learning_progress WHERE student_id = $1 AND career_id = $2
      ORDER BY CASE severity WHEN 'High' THEN 0 WHEN 'Medium' THEN 1 ELSE 2 END`, [studentId, careerId]);
    const overall = rows.length ? Math.round(rows.reduce((sum, r) => sum + r.progressPercent, 0) / rows.length) : 0;
    res.json({ studentId: Number(studentId), careerId: Number(careerId), overallProgressPercent: overall, skills: rows });
  } catch (error) { next(error); }
});
router.patch("/:id", async (req, res, next) => {
  try {
    const { id } = req.params;
    let { progressPercent, status } = req.body;
    const existingResult = await db.query("SELECT * FROM learning_progress WHERE id = $1", [id]);
    const existing = existingResult.rows[0];
    if (!existing) return res.status(404).json({ error: "Progress record not found." });
    if (progressPercent !== undefined) {
      progressPercent = Number(progressPercent);
      if (!Number.isFinite(progressPercent)) {
        return res.status(400).json({ error: "progressPercent must be a number from 0 to 100." });
      }
      progressPercent = Math.max(0, Math.min(100, progressPercent));
      status = progressPercent === 0 ? "not_started" : progressPercent === 100 ? "completed" : "in_progress";
    } else if (status) {
      if (!["not_started", "in_progress", "completed"].includes(status)) {
        return res.status(400).json({ error: "Invalid progress status." });
      }
      progressPercent = status === "completed" ? 100 : status === "not_started" ? 0 : existing.progress_percent;
    } else {
      return res.status(400).json({ error: "Provide progressPercent or status." });
    }
    const { rows } = await db.query(`UPDATE learning_progress SET progress_percent = $1, status = $2,
      updated_at = CURRENT_TIMESTAMP WHERE id = $3 RETURNING *`, [progressPercent, status, id]);
    res.json(rows[0]);
  } catch (error) { next(error); }
});
module.exports = router;
