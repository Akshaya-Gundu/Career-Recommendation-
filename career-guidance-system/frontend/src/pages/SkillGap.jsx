import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api";

export default function SkillGap({ studentId, career }) {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!studentId || !career) {
      setLoading(false);
      return;
    }
    api
      .getSkillGap(studentId, career.id)
      .then(setData)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [studentId, career]);

  if (!studentId) {
    return (
      <div>
        <h1 className="section-heading">Skill Gap Analysis</h1>
        <div className="empty-state">Create your profile first.</div>
      </div>
    );
  }
  if (!career) {
    return (
      <div>
        <h1 className="section-heading">Skill Gap Analysis</h1>
        <div className="empty-state">
          Choose a target career from <Link to="/recommendations">Recommendations</Link> first.
        </div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="section-heading">Skill gap: {career.name}</h1>
      <p className="section-sub">
        Skills you're missing or under-proficient in for this role, ranked by how much they'll
        hold you back.
      </p>

      {error && <div className="error-banner">{error}</div>}
      {loading && <p>Analyzing…</p>}

      {data && (
        <>
          {data.gaps.length === 0 ? (
            <div className="empty-state">
              No gaps found — your skills already cover this role's requirements.
            </div>
          ) : (
            data.gaps.map((g) => (
              <div className={`skill-gap-row sev-${g.severity}`} key={g.skill}>
                <div>
                  <div className="skill-name">{g.skill}</div>
                  <div className="skill-meta">
                    Current proficiency: {g.currentProficiency}/5 · Importance: {g.importance}/3
                  </div>
                </div>
                <span className={`severity-tag sev-${g.severity}`}>{g.severity}</span>
              </div>
            ))
          )}

          {data.strengths.length > 0 && (
            <>
              <h3 style={{ marginTop: 28, fontSize: 16 }}>Already strong in</h3>
              <p className="section-sub" style={{ marginBottom: 12 }}>
                {data.strengths.map((s) => s.skill).join(", ")}
              </p>
            </>
          )}

          <Link to="/learning-plan">
            <button className="btn-primary" style={{ marginTop: 16 }}>
              Build my learning plan
            </button>
          </Link>
        </>
      )}
    </div>
  );
}
