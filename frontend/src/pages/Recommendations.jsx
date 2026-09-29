import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api";

export default function Recommendations({ studentId, onSelectCareer }) {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!studentId) {
      setLoading(false);
      return;
    }
    api
      .getRecommendations(studentId)
      .then(setData)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [studentId]);

  if (!studentId) {
    return (
      <div>
        <h1 className="section-heading">Recommendations</h1>
        <div className="empty-state">Create your profile first to see career matches.</div>
      </div>
    );
  }

  function selectCareer(rec) {
    onSelectCareer({ id: rec.careerId, name: rec.careerName });
    navigate("/skill-gap");
  }

  return (
    <div>
      <h1 className="section-heading">Your top career matches</h1>
      <p className="section-sub">
        Ranked by a weighted match of your skill proficiency and interests against each role's
        requirements. Pick one to see your skill gap and a personalized plan.
      </p>

      {error && <div className="error-banner">{error}</div>}
      {loading && <p>Loading recommendations…</p>}

      {data && (
        <div className="career-list">
          {data.recommendations.map((rec, idx) => (
            <div className="career-row" key={rec.careerId}>
              <div className="career-rank">{idx + 1}</div>
              <div className="career-info">
                <div className="career-name">{rec.careerName}</div>
                <p className="career-desc">{rec.description}</p>
              </div>
              <div className="match-bar-track">
                <div className="match-bar-fill" style={{ width: `${rec.matchPercent}%` }} />
              </div>
              <div className="career-score">{rec.matchPercent}%</div>
              <button className="btn-secondary" onClick={() => selectCareer(rec)}>
                Select
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
