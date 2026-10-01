import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api";

const emptySkill = () => ({ name: "", proficiency: 3 });
const emptyProject = () => ({ title: "", description: "" });

export default function ProfileForm({ onCreated }) {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [education, setEducation] = useState("");
  const [skills, setSkills] = useState([emptySkill()]);
  const [interests, setInterests] = useState("");
  const [projects, setProjects] = useState([emptyProject()]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function updateSkill(i, field, value) {
    setSkills((s) => s.map((sk, idx) => (idx === i ? { ...sk, [field]: value } : sk)));
  }
  function updateProject(i, field, value) {
    setProjects((p) => p.map((pr, idx) => (idx === i ? { ...pr, [field]: value } : pr)));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!name.trim()) {
      setError("Please enter your name.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const payload = {
        name,
        email,
        education,
        skills: skills.filter((s) => s.name.trim()),
        interests: interests
          .split(",")
          .map((i) => i.trim())
          .filter(Boolean),
        projects: projects.filter((p) => p.title.trim())
      };
      const student = await api.createStudent(payload);
      onCreated(student);
      navigate("/recommendations");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <h1 className="section-heading">Build your profile</h1>
      <p className="section-sub">
        Tell us about your skills, interests and projects. The recommendation engine uses this
        to match you against real career profiles.
      </p>

      {error && <div className="error-banner">{error}</div>}

      <form onSubmit={handleSubmit}>
        <div className="row">
          <div className="form-block">
            <label className="form-label">Full name</label>
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Asha Rao" />
          </div>
          <div className="form-block">
            <label className="form-label">Email (optional)</label>
            <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="asha@email.com" />
          </div>
        </div>

        <div className="form-block">
          <label className="form-label">Education</label>
          <input
            value={education}
            onChange={(e) => setEducation(e.target.value)}
            placeholder="B.Tech Computer Science, 3rd year"
          />
        </div>

        <div className="form-block">
          <label className="form-label">Skills &amp; proficiency (1–5)</label>
          {skills.map((s, i) => (
            <div className="repeat-row" key={i}>
              <input
                placeholder="e.g. Python, React, SQL"
                value={s.name}
                onChange={(e) => updateSkill(i, "name", e.target.value)}
                style={{ flex: 3 }}
              />
              <select
                value={s.proficiency}
                onChange={(e) => updateSkill(i, "proficiency", Number(e.target.value))}
                style={{ flex: 1 }}
              >
                {[1, 2, 3, 4, 5].map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>
              <button
                type="button"
                className="icon-btn"
                onClick={() => setSkills((s) => s.filter((_, idx) => idx !== i))}
                aria-label="Remove skill"
              >
                ×
              </button>
            </div>
          ))}
          <button type="button" className="text-btn" onClick={() => setSkills((s) => [...s, emptySkill()])}>
            + Add another skill
          </button>
        </div>

        <div className="form-block">
          <label className="form-label">Interests (comma-separated)</label>
          <input
            value={interests}
            onChange={(e) => setInterests(e.target.value)}
            placeholder="e.g. coding, data, design"
          />
        </div>

        <div className="form-block">
          <label className="form-label">Projects</label>
          {projects.map((p, i) => (
            <div className="repeat-row" key={i}>
              <input
                placeholder="Project title"
                value={p.title}
                onChange={(e) => updateProject(i, "title", e.target.value)}
                style={{ flex: 1 }}
              />
              <input
                placeholder="Short description"
                value={p.description}
                onChange={(e) => updateProject(i, "description", e.target.value)}
                style={{ flex: 2 }}
              />
              <button
                type="button"
                className="icon-btn"
                onClick={() => setProjects((p) => p.filter((_, idx) => idx !== i))}
                aria-label="Remove project"
              >
                ×
              </button>
            </div>
          ))}
          <button type="button" className="text-btn" onClick={() => setProjects((p) => [...p, emptyProject()])}>
            + Add another project
          </button>
        </div>

        <button className="btn-primary" type="submit" disabled={loading}>
          {loading ? "Saving..." : "Save profile & get recommendations"}
        </button>
      </form>
    </div>
  );
}
