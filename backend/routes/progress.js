const express = require("express");
const router = express.Router();
const db = require("../db");

// GET /api/progress/:studentId/:careerId  -> list of tracked skills + summary
router.get("/:studentId/:careerId", (req, res) => {
  const { studentId, careerId } = req.params;

  const rows = db
    .prepare(
      `SELECT id, skill_name AS skill, severity, status, progress_percent AS progressPercent, updated_at AS updatedAt
       FROM learning_progress WHERE student_id = ? AND career_id = ?
       ORDER BY CASE severity WHEN 'High' THEN 0 WHEN 'Medium' THEN 1 ELSE 2 END`
    )
    .all(studentId, careerId);

  const overall =
    rows.length > 0
      ? Math.round(rows.reduce((sum, r) => sum + r.progressPercent, 0) / rows.length)
      : 0;

  res.json({
    studentId: Number(studentId),
    careerId: Number(careerId),
    overallProgressPercent: overall,
    skills: rows
  });
});

// PATCH /api/progress/:id  { progressPercent } or { status }
router.patch("/:id", (req, res) => {
  const { id } = req.params;
  let { progressPercent, status } = req.body;

  const existing = db.prepare("SELECT * FROM learning_progress WHERE id = ?").get(id);
  if (!existing) return res.status(404).json({ error: "Progress record not found." });

  if (progressPercent !== undefined) {
    progressPercent = Math.max(0, Math.min(100, Number(progressPercent)));
    status = progressPercent === 0 ? "not_started" : progressPercent === 100 ? "completed" : "in_progress";
  } else if (status && progressPercent === undefined) {
    progressPercent =
      status === "completed" ? 100 : status === "not_started" ? 0 : existing.progress_percent;
  }

  db.prepare(
    `UPDATE learning_progress SET progress_percent = ?, status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`
  ).run(progressPercent, status, id);

  res.json(db.prepare("SELECT * FROM learning_progress WHERE id = ?").get(id));
});

module.exports = router;
