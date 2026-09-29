const path = require("path");
const Database = require("better-sqlite3");
const careers = require("./data/careers");

const db = new Database(path.join(__dirname, "career.db"));
db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");

db.exec(`
CREATE TABLE IF NOT EXISTS students (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT,
  education TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS student_skills (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  student_id INTEGER NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  skill_name TEXT NOT NULL,
  proficiency INTEGER NOT NULL DEFAULT 1 -- 1 (beginner) - 5 (expert)
);

CREATE TABLE IF NOT EXISTS student_interests (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  student_id INTEGER NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  interest TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS student_projects (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  student_id INTEGER NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT
);

CREATE TABLE IF NOT EXISTS careers (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT UNIQUE NOT NULL,
  description TEXT
);

CREATE TABLE IF NOT EXISTS career_skills (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  career_id INTEGER NOT NULL REFERENCES careers(id) ON DELETE CASCADE,
  skill_name TEXT NOT NULL,
  weight INTEGER NOT NULL -- 1-3 importance
);

CREATE TABLE IF NOT EXISTS career_interests (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  career_id INTEGER NOT NULL REFERENCES careers(id) ON DELETE CASCADE,
  interest TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS learning_progress (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  student_id INTEGER NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  career_id INTEGER NOT NULL REFERENCES careers(id) ON DELETE CASCADE,
  skill_name TEXT NOT NULL,
  severity TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'not_started', -- not_started | in_progress | completed
  progress_percent INTEGER NOT NULL DEFAULT 0,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(student_id, career_id, skill_name)
);
`);

function seedCareers() {
  const count = db.prepare("SELECT COUNT(*) AS c FROM careers").get().c;
  if (count > 0) return;

  const insertCareer = db.prepare(
    "INSERT INTO careers (name, description) VALUES (?, ?)"
  );
  const insertSkill = db.prepare(
    "INSERT INTO career_skills (career_id, skill_name, weight) VALUES (?, ?, ?)"
  );
  const insertInterest = db.prepare(
    "INSERT INTO career_interests (career_id, interest) VALUES (?, ?)"
  );

  const seedAll = db.transaction(() => {
    for (const career of careers) {
      const info = insertCareer.run(career.name, career.description);
      const careerId = info.lastInsertRowid;
      for (const [skill, weight] of Object.entries(career.skills)) {
        insertSkill.run(careerId, skill, weight);
      }
      for (const interest of career.interests) {
        insertInterest.run(careerId, interest);
      }
    }
  });

  seedAll();
  console.log(`Seeded ${careers.length} careers.`);
}

seedCareers();

module.exports = db;
