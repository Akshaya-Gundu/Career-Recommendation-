import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api";

export default function LearningPlan({ studentId, career }) {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!studentId || !career) {
      setLoading(false);
      return;
    }
    api
      .getLearningPlan(studentId, career.id)
      .then(setData)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [studentId, career]);

  if (!studentId) {
    return (
      <div>
        <h1 className="section-heading">Learning Plan</h1>
        <div className="empty-state">Create your profile first.</div>
      </div>
    );
  }
  if (!career) {
    return (
      <div>
        <h1 className="section-heading">Learning Plan</h1>
        <div className="empty-state">
          Choose a target career from <Link to="/recommendations">Recommendations</Link> first.
        </div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="section-heading">Your plan for {career.name}</h1>
      {data && (
        <p className="section-sub">
          Estimated <strong style={{ color: "var(--text)" }}>{data.totalEstimatedWeeks} weeks</strong> to
          close your skill gaps, ordered by priority.
        </p>
      )}

      {error && <div className="error-banner">{error}</div>}
      {loading && <p>Building plan…</p>}

      {data && data.plan.length === 0 && (
        <div className="empty-state">No gaps to plan for — you're ready for this role.</div>
      )}

      {data &&
        data.plan.map((item) => (
          <div className="plan-card" key={item.skill}>
            <div className="plan-card-head">
              <div>
                <div className="skill-name">{item.skill}</div>
                <span className={`severity-tag sev-${item.severity}`}>{item.severity} priority</span>
              </div>
              <div className="plan-weeks">~{item.estimatedWeeks} week{item.estimatedWeeks > 1 ? "s" : ""}</div>
            </div>
            <ul className="resource-list">
              {item.resources.map((r) => (
                <li key={r.url}>
                  <a href={r.url} target="_blank" rel="noreferrer">
                    {r.title}
                  </a>
                  <span className="resource-type">{r.type}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}

      {data && data.plan.length > 0 && (
        <Link to="/progress">
          <button className="btn-primary" style={{ marginTop: 8 }}>
            Track my progress
          </button>
        </Link>
      )}
    </div>
  );
}
